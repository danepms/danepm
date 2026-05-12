"use server";

export async function getVacantUnits() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const res = await fetch(`${apiUrl}/marketing/vacancies`, { cache: 'no-store' });
    const data = await res.json();

    if (!data.success) return { success: false, error: data.error };
    
    const units = data.vacancies.map((v: any) => ({
        id: v.id,
        name: v.unitName,
        type: v.unitType,
        rent: v.rent,
        property: v.propertyName,
        location: v.location,
        imageUrl: v.imageUrl
    }));

    return { success: true, units };
  } catch (error: any) {
    console.error("Failed to fetch vacancies:", error);
    return { success: false, error: error.message };
  }
}

export async function getVacancyDetails(id: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const res = await fetch(`${apiUrl}/marketing/vacancies/${id}`, { cache: 'no-store' });
    const data = await res.json();
    return data;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
