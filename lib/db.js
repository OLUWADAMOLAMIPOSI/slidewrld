import { supabase } from "./supabase";

const ROW_ID = 1;

export async function readData() {
  const { data, error } = await supabase
    .from("app_data")
    .select("data")
    .eq("id", ROW_ID)
    .single();

  if (error) {
    throw new Error("Failed to read data: " + error.message);
  }

  return data.data;
}

export async function writeData(mutator) {
  const current = await readData();
  mutator(current);

  const { error } = await supabase
    .from("app_data")
    .update({ data: current, updated_at: new Date().toISOString() })
    .eq("id", ROW_ID);

  if (error) {
    throw new Error("Failed to write data: " + error.message);
  }

  return current;
}