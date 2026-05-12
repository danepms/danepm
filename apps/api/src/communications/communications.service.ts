import { Injectable, Inject, Logger } from '@nestjs/common';
import { DRIZZLE } from '../database/database.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@dane/database';
import { eq, and, desc, count, sql, inArray, asc } from 'drizzle-orm';
import { SystemService } from '../system/system.service';
import { CommsService } from '../comms/comms.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CommunicationsService {
  private readonly logger = new Logger(CommunicationsService.name);

  constructor(
    @Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>,
    private systemService: SystemService,
    private commsService: CommsService,
  ) {}

  async getCommunicationTemplates(managerId: string) {
    const results = await this.db
      .select()
      .from(schema.communicationTemplate)
      .where(eq(schema.communicationTemplate.managerId, managerId))
      .orderBy(desc(schema.communicationTemplate.createdAt));
    return { success: true, templates: results };
  }

  async saveCommunicationTemplate(data: any) {
    const id = data.id || `tpl-${uuidv4().slice(0, 8)}`;
    if (data.id) {
        await this.db.update(schema.communicationTemplate).set({ ...data, updatedAt: new Date() }).where(eq(schema.communicationTemplate.id, id));
    } else {
        await this.db.insert(schema.communicationTemplate).values({
            id,
            ...data,
            createdAt: new Date(),
        });
    }
    return { success: true, id };
  }

  async getTargetedTenants(managerId: string, filters: { propertyId?: string, hasArrears?: boolean, status?: string }) {
    let conditions = [eq(schema.tenant.managerId, managerId)];
    if (filters.propertyId) conditions.push(eq(schema.tenant.propertyId, filters.propertyId));
    if (filters.status) conditions.push(eq(schema.tenant.status, filters.status));
    if (filters.hasArrears) conditions.push(sql`CAST(${schema.tenant.arrears} AS DECIMAL) > 0`);

    const results = await this.db
        .select({
            id: schema.tenant.id,
            name: schema.tenant.name,
            email: schema.tenant.email,
            phone: schema.tenant.phone,
            unitId: schema.tenant.unitId,
            arrears: schema.tenant.arrears
        })
        .from(schema.tenant)
        .where(and(...conditions));

    return { success: true, tenants: results };
  }

  async launchCampaign(data: {
    managerId: string;
    name: string;
    recipientIds: string[];
    channel: 'sms' | 'email' | 'both';
    customSubject?: string;
    customContent?: string;
  }) {
    const batchId = `bat-${uuidv4().slice(0, 8)}`;
    
    await this.db.insert(schema.communicationBatch).values({
        id: batchId,
        managerId: data.managerId,
        name: data.name,
        channel: data.channel,
        status: 'processing',
        totalRecipients: data.recipientIds.length.toString(),
        successCount: '0',
        failedCount: '0',
        createdAt: new Date(),
    });

    await this.systemService.logSystemEvent({
        managerId: data.managerId,
        action: 'CAMPAIGN_LAUNCHED',
        entityType: 'communication',
        entityId: batchId,
        payload: { recipientCount: data.recipientIds.length, channel: data.channel, name: data.name }
    });

    // Fire and forget background sending
    this.processCampaign(batchId, data);

    return { success: true, batchId };
  }

  private async processCampaign(batchId: string, data: any) {
    const recipients = await this.db.select().from(schema.tenant).where(inArray(schema.tenant.id, data.recipientIds));
    
    let successCount = 0;
    let failedCount = 0;

    for (const recipient of recipients) {
        try {
            let sent = false;
            let externalId = null;

            // Handle Variable Replacement
            const subject = await this.replaceVariables(data.customSubject || data.name, recipient);
            const content = await this.replaceVariables(data.customContent || '', recipient);

            if ((data.channel === 'email' || data.channel === 'both') && recipient.email) {
                const res = await this.commsService.sendEmail({
                    to: recipient.email,
                    subject: subject,
                    html: content,
                    text: content
                });
                if (res.success) {
                    sent = true;
                    externalId = res.messageId;
                    
                    // Log Email
                    await this.db.insert(schema.communicationLog).values({
                        id: `log-${uuidv4().slice(0, 8)}`,
                        managerId: data.managerId,
                        tenantId: recipient.id,
                        propertyId: recipient.propertyId,
                        batchId: batchId,
                        channel: 'email',
                        type: 'broadcast',
                        subject: subject,
                        content: content,
                        status: 'sent',
                        externalId: externalId,
                        sentAt: new Date(),
                        createdAt: new Date(),
                    });
                }
            }

            if ((data.channel === 'sms' || data.channel === 'both') && recipient.phone) {
                const res = await this.commsService.sendSMS({
                    to: recipient.phone,
                    message: content
                });
                if (res.success) {
                    sent = true;
                    externalId = res.messageId;

                    // Log SMS
                    await this.db.insert(schema.communicationLog).values({
                        id: `log-${uuidv4().slice(0, 8)}`,
                        managerId: data.managerId,
                        tenantId: recipient.id,
                        propertyId: recipient.propertyId,
                        batchId: batchId,
                        channel: 'sms',
                        type: 'broadcast',
                        content: content,
                        status: 'sent',
                        externalId: externalId,
                        sentAt: new Date(),
                        createdAt: new Date(),
                    });
                }
            }

            if (sent) successCount++;
            else failedCount++;
        } catch (e) {
            this.logger.error(`Failed to send communication to tenant ${recipient.id}: ${e.message}`);
            failedCount++;
        }
    }

    await this.db.update(schema.communicationBatch)
        .set({ 
            status: 'completed', 
            successCount: successCount.toString(), 
            failedCount: failedCount.toString()
        })
        .where(eq(schema.communicationBatch.id, batchId));
  }

  private async replaceVariables(content: string, tenant: any) {
    if (!content) return '';
    let replaced = content;
    replaced = replaced.replace(/{{tenant_name}}/g, tenant.name || '');
    replaced = replaced.replace(/{{unit_name}}/g, tenant.unitId || '');
    replaced = replaced.replace(/{{total_amount}}/g, tenant.arrears || '0');
    
    // Lazy load property if needed
    if (replaced.includes('{{property_name}}') || replaced.includes('{{property_location}}') || replaced.includes('{{due_date}}') || replaced.includes('{{penalty_notice}}')) {
        const [prop] = await this.db.select().from(schema.property).where(eq(schema.property.id, tenant.propertyId));
        if (prop) {
            replaced = replaced.replace(/{{property_name}}/g, prop.name || '');
            replaced = replaced.replace(/{{property_location}}/g, prop.location || '');
            const config = typeof prop.config === 'string' ? JSON.parse(prop.config) : (prop.config || {}) as any;
            replaced = replaced.replace(/{{due_date}}/g, config.rentDueDate || '5th');
            
            if (replaced.includes('{{penalty_notice}}')) {
                const [manager] = await this.db.select().from(schema.user).where(eq(schema.user.id, tenant.managerId));
                const financeConfig = (manager?.financeConfig || {}) as any;
                const penaltyStr = financeConfig.penaltyType === 'percent' 
                    ? `${financeConfig.penaltyValue || 5}% penalty`
                    : `KES ${financeConfig.penaltyValue || 1000} penalty`;
                replaced = replaced.replace(/{{penalty_notice}}/g, `Subject to ${penaltyStr} after grace period`);
            }
        }
    }

    if (replaced.includes('{{business_name}}')) {
        const [manager] = await this.db.select().from(schema.user).where(eq(schema.user.id, tenant.managerId));
        if (manager && manager.businessConfig) {
            replaced = replaced.replace(/{{business_name}}/g, (manager.businessConfig as any).companyName || manager.name);
        } else {
            replaced = replaced.replace(/{{business_name}}/g, manager?.name || 'Management');
        }
    }
    
    return replaced;
  }

  async getCommunicationBatches(managerId: string) {
    const results = await this.db
        .select()
        .from(schema.communicationBatch)
        .where(eq(schema.communicationBatch.managerId, managerId))
        .orderBy(desc(schema.communicationBatch.createdAt));
    return { success: true, batches: results };
  }

  async getCommunicationFlows(managerId: string) {
    const results = await this.db
        .select()
        .from(schema.communicationFlow)
        .where(eq(schema.communicationFlow.managerId, managerId));
    return { success: true, flows: results };
  }

  async saveCommunicationFlow(data: any) {
    const id = data.id || `flo-${uuidv4().slice(0, 8)}`;
    if (data.id) {
        await this.db.update(schema.communicationFlow).set({ ...data, updatedAt: new Date() }).where(eq(schema.communicationFlow.id, id));
    } else {
        await this.db.insert(schema.communicationFlow).values({
            id,
            ...data,
            createdAt: new Date(),
        });
    }
    return { success: true, id };
  }

  async getCommunicationAnalytics(managerId: string) {
    const [batches] = await this.db.select({ count: count() }).from(schema.communicationBatch).where(eq(schema.communicationBatch.managerId, managerId));
    const [flowsCount] = await this.db.select({ count: count() }).from(schema.communicationFlow).where(eq(schema.communicationFlow.managerId, managerId));
    
    const stats = await this.db
        .select({
            channel: schema.communicationLog.channel,
            count: count()
        })
        .from(schema.communicationLog)
        .where(eq(schema.communicationLog.managerId, managerId))
        .groupBy(schema.communicationLog.channel);

    const propertyDist = await this.db
        .select({
            propertyId: schema.communicationLog.propertyId,
            propertyName: schema.property.name,
            count: count()
        })
        .from(schema.communicationLog)
        .leftJoin(schema.property, eq(schema.communicationLog.propertyId, schema.property.id))
        .where(eq(schema.communicationLog.managerId, managerId))
        .groupBy(schema.communicationLog.propertyId, schema.property.name);

    return {
        success: true,
        totalBatches: batches.count,
        activeFlows: flowsCount.count,
        stats: stats.length > 0 ? stats : [{ channel: 'sms', count: 0 }, { channel: 'email', count: 0 }],
        propertyDist: propertyDist,
        deliveryRate: 99.9,
        engagementScore: 88
    };
  }

  async triggerFlow(managerId: string, trigger: string, tenantId: string) {
    const [flow] = await this.db.select().from(schema.communicationFlow)
        .where(and(eq(schema.communicationFlow.managerId, managerId), eq(schema.communicationFlow.trigger, trigger), eq(schema.communicationFlow.isActive, true)));
    
    if (!flow) {
        this.logger.warn(`No active flow found for trigger: ${trigger} (Manager: ${managerId})`);
        return { success: false, error: "Flow not found or inactive" };
    }

    const steps = await this.db.select({
        step: schema.communicationFlowStep,
        template: schema.communicationTemplate
    })
    .from(schema.communicationFlowStep)
    .innerJoin(schema.communicationTemplate, eq(schema.communicationFlowStep.templateId, schema.communicationTemplate.id))
    .where(eq(schema.communicationFlowStep.flowId, flow.id));

    const [recipient] = await this.db.select().from(schema.tenant).where(eq(schema.tenant.id, tenantId));
    if (!recipient) return { success: false, error: "Tenant not found" };

    const immediateSteps = steps.filter(s => s.step.offsetDays === 0);
    const delayedSteps = steps.filter(s => (s.step.offsetDays || 0) !== 0);
    
    for (const step of immediateSteps) {
        await this.executeFlowStep(managerId, recipient, step.template, step.step.channel || 'both', flow.id);
    }

    for (const step of delayedSteps) {
        const scheduledFor = new Date();
        scheduledFor.setDate(scheduledFor.getDate() + (step.step.offsetDays || 0));
        
        const subject = await this.replaceVariables(step.template.subject || '', recipient);
        const content = await this.replaceVariables(step.template.contentText || '', recipient);

        await this.db.insert(schema.communicationQueue).values({
            id: `q-${uuidv4().slice(0, 8)}`,
            managerId,
            tenantId: recipient.id,
            templateId: step.template.id,
            flowId: flow.id,
            channel: step.step.channel || 'both',
            subject,
            content,
            scheduledFor,
            status: 'pending',
            createdAt: new Date(),
        });
    }

    await this.systemService.logSystemEvent({
        managerId,
        action: 'FLOW_TRIGGERED',
        entityType: 'communication',
        entityId: tenantId,
        payload: { trigger, flowName: flow.name, immediate: immediateSteps.length, queued: delayedSteps.length }
    });

    return { success: true };
  }

  async getUpcomingMessages(managerId: string) {
    const results = await this.db
        .select({
            id: schema.communicationQueue.id,
            tenantName: schema.tenant.name,
            unitId: schema.tenant.unitId,
            channel: schema.communicationQueue.channel,
            subject: schema.communicationQueue.subject,
            scheduledFor: schema.communicationQueue.scheduledFor,
            status: schema.communicationQueue.status,
            flowName: schema.communicationFlow.name,
        })
        .from(schema.communicationQueue)
        .innerJoin(schema.tenant, eq(schema.communicationQueue.tenantId, schema.tenant.id))
        .leftJoin(schema.communicationFlow, eq(schema.communicationQueue.flowId, schema.communicationFlow.id))
        .where(and(
            eq(schema.communicationQueue.managerId, managerId),
            eq(schema.communicationQueue.status, 'pending')
        ))
        .orderBy(asc(schema.communicationQueue.scheduledFor));

    return { success: true, upcoming: results };
  }

  private async executeFlowStep(managerId: string, tenant: any, template: any, channel: string, flowId: string) {
    try {
        const subject = await this.replaceVariables(template.subject || '', tenant);
        const content = await this.replaceVariables(template.contentText || '', tenant);

        if ((channel === 'email' || channel === 'both') && tenant.email) {
            const res = await this.commsService.sendEmail({
                to: tenant.email,
                subject,
                html: content,
                text: content
            });
            if (res.success) {
                await this.db.insert(schema.communicationLog).values({
                    id: `log-${uuidv4().slice(0, 8)}`,
                    managerId,
                    tenantId: tenant.id,
                    propertyId: tenant.propertyId,
                    channel: 'email',
                    type: 'flow',
                    subject,
                    content,
                    status: 'sent',
                    externalId: res.messageId,
                    sentAt: new Date(),
                    createdAt: new Date(),
                });
            }
        }

        if ((channel === 'sms' || channel === 'both') && tenant.phone) {
            const res = await this.commsService.sendSMS({
                to: tenant.phone,
                message: content
            });
            if (res.success) {
                await this.db.insert(schema.communicationLog).values({
                    id: `log-${uuidv4().slice(0, 8)}`,
                    managerId,
                    tenantId: tenant.id,
                    propertyId: tenant.propertyId,
                    channel: 'sms',
                    type: 'flow',
                    content,
                    status: 'sent',
                    externalId: res.messageId,
                    sentAt: new Date(),
                    createdAt: new Date(),
                });
            }
        }
    } catch (e) {
        this.logger.error(`Flow Step Execution Failed: ${e.message}`);
    }
  }

  async updateFlowStatus(id: string, isActive: boolean, managerId: string) {
    await this.db.update(schema.communicationFlow)
        .set({ isActive, updatedAt: new Date() })
        .where(and(eq(schema.communicationFlow.id, id), eq(schema.communicationFlow.managerId, managerId)));
    
    return { success: true };
  }
}
