import type { Company } from '@/types/organization'
export function contactDefaults(company: Company) {
  return {
    contact_person_name: company.contact_person_name ?? '',
    contact_person_email: company.contact_person_email ?? '',
    contact_person_phone: company.contact_person_phone ?? '',
    contact_person_designation: company.contact_person_designation ?? '',
  }
}
export function billingDefaults(company: Company) {
  return {
    business_name: company.billing_details?.business_name ?? company.name,
    address: company.billing_details?.address ?? '',
    postal_code: company.billing_details?.postal_code ?? '',
    city: company.billing_details?.city ?? '',
    kra_pin: company.kra_pin ?? '',
  }
}
