export interface Table {
  id: number;
  name: string;
  status: "available" | "occupied" | "reserved" | "inactive";
}
