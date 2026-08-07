
alter table public.enquiries enable row level security;

drop policy if exists "public_insert_enquiries" on public.enquiries;
drop policy if exists "admin_select_enquiries" on public.enquiries;
drop policy if exists "admin_update_enquiries" on public.enquiries;
drop policy if exists "admin_delete_enquiries" on public.enquiries;
