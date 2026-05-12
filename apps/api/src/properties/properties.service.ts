import { Injectable, Inject, Logger } from '@nestjs/common';
import { DRIZZLE } from '../database/database.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@dane/database';
import { eq, and, sql, count } from 'drizzle-orm';
import { SystemService } from '../system/system.service';
import { StorageService } from '../storage/storage.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PropertiesService {
  private readonly logger = new Logger(PropertiesService.name);

  constructor(
    @Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>,
    private systemService: SystemService,
    private storageService: StorageService,
  ) {}

  async getUserProperties(managerId: string) {
    const results = await this.db
      .select()
      .from(schema.property)
      .where(eq(schema.property.userId, managerId));
    return { success: true, properties: results || [] };
  }

  async getUserPropertyCount(managerId: string) {
    const [result] = await this.db.select({ val: count() }).from(schema.property).where(eq(schema.property.userId, managerId));
    return { success: true, count: result.val };
  }

  async getPropertyById(id: string, managerId: string) {
    const [result] = await this.db
      .select()
      .from(schema.property)
      .where(and(eq(schema.property.id, id), eq(schema.property.userId, managerId)));
    
    if (!result) return { success: false, error: "Property not found" };
    return { success: true, property: result };
  }

  async createProperty(data: any) {
    const id = `prop-${uuidv4().slice(0, 8)}`;
    await this.db.insert(schema.property).values({
      id,
      ...data,
      createdAt: new Date(),
    });

    await this.systemService.logSystemEvent({
        managerId: data.userId,
        action: 'PROPERTY_CREATED',
        entityType: 'property',
        entityId: id,
        payload: { name: data.name }
    });

    return { success: true, id };
  }

  async completePropertySetup(id: string, setupData: any, managerId?: string) {
    const userId = managerId || setupData.userId;
    let query = eq(schema.property.id, id);
    if (userId) query = and(query, eq(schema.property.userId, userId)) as any;

    await this.db.update(schema.property)
        .set({ 
            isLive: true, 
            setupStep: 'complete',
            config: setupData
        })
        .where(query);

    await this.systemService.logSystemEvent({
        managerId: userId || 'system',
        action: 'PROPERTY_SETUP_COMPLETED',
        entityType: 'property',
        entityId: id,
        payload: setupData
    });

    return { success: true };
  }

  async uploadMasterExcel(propertyId: string, file: Buffer, managerId: string, originalName: string, contentType: string) {
    const key = `master-registries/${propertyId}/${uuidv4()}.xlsx`;
    const url = await this.storageService.uploadToR2(file, key, contentType);

    let query = eq(schema.property.id, propertyId);
    if (managerId) query = and(query, eq(schema.property.userId, managerId)) as any;

    await this.db.update(schema.property)
        .set({ 
            config: sql`jsonb_set(coalesce(cast(${schema.property.config} as jsonb), '{}'::jsonb), '{masterRegistryUrl}', ${JSON.stringify(url)})`
        })
        .where(query);

    await this.systemService.logSystemEvent({
        managerId: managerId || 'system',
        action: 'MASTER_EXCEL_UPLOADED',
        entityType: 'property',
        entityId: propertyId,
        payload: { url, fileName: originalName }
    });

    return { success: true, url };
  }

  async updateTenantAssignment(tenantId: string, propertyId: string, unitId: string, moveMode: string = 'move') {
    return await this.db.transaction(async (tx) => {
        const [sourceTenant] = await tx.select().from(schema.tenant).where(eq(schema.tenant.id, tenantId));
        if (!sourceTenant) throw new Error("Tenant not found");

        const managerId = sourceTenant.managerId;

        if (moveMode === 'swap') {
            const [targetTenant] = await tx.select().from(schema.tenant).where(and(eq(schema.tenant.propertyId, propertyId), eq(schema.tenant.unitId, unitId), eq(schema.tenant.status, 'active')));
            if (targetTenant) {
                await tx.update(schema.tenant).set({ propertyId: sourceTenant.propertyId, unitId: sourceTenant.unitId }).where(eq(schema.tenant.id, targetTenant.id));
            }
        } else if (moveMode === 'displace') {
             await tx.update(schema.tenant).set({ status: 'archived' }).where(and(eq(schema.tenant.propertyId, propertyId), eq(schema.tenant.unitId, unitId), eq(schema.tenant.status, 'active')));
        }

        await tx.update(schema.tenant)
            .set({ 
                propertyId: propertyId,
                unitId: unitId,
                updatedAt: new Date()
            })
            .where(eq(schema.tenant.id, tenantId));

        await this.systemService.logSystemEvent({
            managerId,
            action: 'TENANT_RELOCATED',
            entityType: 'tenant',
            entityId: tenantId,
            payload: { propertyId, unitId, moveMode }
        });

        return { success: true };
    });
  }

  async getPropertyStats(id: string, managerId: string) {
    const [tenants] = await this.db.select({ val: count() }).from(schema.tenant).where(eq(schema.tenant.propertyId, id));
    const [maintenance] = await this.db.select({ val: count() }).from(schema.maintenanceRequest).where(and(eq(schema.maintenanceRequest.propertyId, id), eq(schema.maintenanceRequest.status, 'open')));
    
    return {
        success: true,
        stats: {
            tenantCount: tenants.val,
            openMaintenance: maintenance.val
        }
    };
  }

  async getOwnerProperties(ownerId: string) {
    const results = await this.db
        .select()
        .from(schema.property)
        .where(eq(schema.property.ownerId, ownerId));
    return { success: true, properties: results || [] };
  }

  async updatePropertyConfig(id: string, configData: any, managerId: string) {
    await this.db.update(schema.property)
      .set({ config: configData })
      .where(and(eq(schema.property.id, id), eq(schema.property.userId, managerId)));

    await this.systemService.logSystemEvent({
        managerId,
        action: 'PROPERTY_CONFIG_UPDATED',
        entityType: 'property',
        entityId: id,
        payload: configData
    });

    return { success: true };
  }

  async uploadPropertyImage(buffer: Buffer, originalName: string, mimetype: string) {
    try {
      const ext = originalName.split('.').pop() || 'jpg';
      const key = `properties/images/${uuidv4()}.${ext}`;
      const imageUrl = await this.storageService.uploadToR2(buffer, key, mimetype);
      return { success: true, imageUrl };
    } catch (error) {
      this.logger.error(`Property image upload failed: ${error.message}`);
      return { success: false, error: 'Upload failed' };
    }
  }

  async updateMarketingVisibility(id: string, enabled: boolean, managerId: string) {
    await this.db.update(schema.property)
      .set({ marketingEnabled: enabled })
      .where(and(eq(schema.property.id, id), eq(schema.property.userId, managerId)));

    await this.systemService.logSystemEvent({
        managerId,
        action: 'PROPERTY_MARKETING_UPDATED',
        entityType: 'property',
        entityId: id,
        payload: { marketingEnabled: enabled }
    });

    return { success: true };
  }

  async getPublicVacancies() {
    const marketableProperties = await this.db
      .select()
      .from(schema.property)
      .where(and(
        eq(schema.property.marketingEnabled, true),
        eq(schema.property.isLive, true)
      ));

    const vacancies: any[] = [];

    for (const prop of marketableProperties) {
      const config = typeof prop.config === 'string' ? JSON.parse(prop.config || '{}') : (prop.config || {});
      const units = config.units || [];
      const rents = config.rents || {};
      
      const vacantUnits = units.filter((u: any) => u.status === 'vacant');

      for (const unit of vacantUnits) {
        // Rent extraction (handle range or flat)
        let rentValue = rents[unit.typeId] || '0';
        let rentAmount = 0;
        if (Array.isArray(rentValue)) rentAmount = parseFloat(rentValue[0]);
        else if (typeof rentValue === 'object' && rentValue !== null) rentAmount = parseFloat(rentValue.min);
        else rentAmount = parseFloat(rentValue);

        vacancies.push({
          id: `${prop.id}-${unit.name}`,
          propertyId: prop.id,
          propertyName: prop.name,
          location: prop.location,
          unitName: unit.name,
          unitType: unit.typeId,
          rent: rentAmount,
          imageUrl: prop.imageUrl,
          features: config.features || [],
          // Estimated move-in: usually 1 month deposit + 1st month rent
          estimatedMoveIn: rentAmount * 2 
        });
      }
    }

    return { success: true, vacancies };
  }

  async getVacancyDetails(vacancyId: string) {
    // vacancyId format: {propertyId}-{unitName}
    const [propertyId, unitName] = vacancyId.split('-');
    
    const [prop] = await this.db
      .select()
      .from(schema.property)
      .where(and(eq(schema.property.id, propertyId), eq(schema.property.marketingEnabled, true)));

    if (!prop) return { success: false, error: "Vacancy not available" };

    const config = typeof prop.config === 'string' ? JSON.parse(prop.config || '{}') : (prop.config || {});
    const unit = config.units?.find((u: any) => u.name === unitName && u.status === 'vacant');

    if (!unit) return { success: false, error: "Unit no longer available" };

    const rents = config.rents || {};
    let rentValue = rents[unit.typeId] || '0';
    let rentAmount = 0;
    if (Array.isArray(rentValue)) rentAmount = parseFloat(rentValue[0]);
    else if (typeof rentValue === 'object' && rentValue !== null) rentAmount = parseFloat(rentValue.min);
    else rentAmount = parseFloat(rentValue);

    return {
      success: true,
      vacancy: {
        id: vacancyId,
        property: {
          name: prop.name,
          location: prop.location,
          description: config.description || `Beautiful ${unit.typeId} unit at ${prop.name}`,
        },
        unit: {
          name: unit.name,
          type: unit.typeId,
          rent: rentAmount,
          deposit: rentAmount, // Default to 1 month
          totalMoveIn: rentAmount * 2,
          recurringFees: config.recurring || []
        }
      }
    };
  }
}
