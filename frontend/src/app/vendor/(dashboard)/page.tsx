import { redirect } from 'next/navigation';

export default async function VendorDashboard() {
    redirect('/vendor/profile');
}
