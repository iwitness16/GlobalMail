import { supabase } from "./supabase"

export interface Bill {
  id:         string
  created_at: string
  name:       string
}

export async function getAllBills(): Promise<Bill[]> {
  const { data, error } = await supabase
    .from("bills")
    .select("*")
    .order("name", { ascending: true })
  if (error) throw error
  return (data ?? []) as Bill[]
}

export async function createBill(name: string): Promise<Bill> {
  const { data, error } = await supabase
    .from("bills")
    .insert({ name: name.trim() } as any)
    .select()
    .single()
  if (error) throw error
  return data as Bill
}

export async function deleteBill(id: string): Promise<void> {
  const { error } = await supabase.from("bills").delete().eq("id", id)
  if (error) throw error
}
