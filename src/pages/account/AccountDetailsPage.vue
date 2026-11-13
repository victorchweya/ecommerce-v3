<script setup lang="ts">
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'
import AccountPreferences from '@/components/account/AccountPreferences.vue'
import AccountLayout from '@/layouts/AccountLayout.vue'
import ProfileForm from '@/components/account/ProfileForm.vue'
import PasswordChangeForm from '@/components/account/PasswordChangeForm.vue'
import CompanyDetails from '@/components/organization/CompanyDetails.vue'
import CompanyStaff from '@/components/organization/CompanyStaff.vue'
import { useCommerceContext } from '@/composables/shared/useCommerceContext'
const { profile, key } = useCommerceContext()
</script>
<template>
  <AccountLayout>
    <header class="flex flex-col gap-2">
      <h1 class="text-2xl font-semibold">Account details</h1>
      <p class="text-muted-color">Manage your profile, company details and account security.</p>
    </header>
    <Tabs
      v-if="profile.data.value"
      :key="key"
      value="company"
      scrollable
      class="min-w-0"
      :dt="{ tabpanel: { background: 'transparent' } }"
    >
      <TabList aria-label="Account detail sections">
        <Tab value="company">Company</Tab>
        <Tab value="team">Team</Tab>
        <Tab value="preferences">Preferences</Tab>
        <Tab value="profile">Profile</Tab>
        <Tab value="security">Security</Tab>
      </TabList>
      <TabPanels class="max-w-2xl px-0 pt-6">
        <TabPanel value="company"><CompanyDetails /></TabPanel>
        <TabPanel value="team"><CompanyStaff /></TabPanel>
        <TabPanel value="preferences"
          ><AccountPreferences :profile="profile.data.value"
        /></TabPanel>
        <TabPanel value="profile"><ProfileForm :profile="profile.data.value" /></TabPanel>
        <TabPanel value="security"><PasswordChangeForm /></TabPanel>
      </TabPanels>
    </Tabs>
  </AccountLayout>
</template>
