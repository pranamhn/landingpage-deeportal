import { AdminDataQualityTabsClient } from "./DataQualityTabsClient";
import { getDataQualityFromJson } from "@/lib/adminJsonAdapter";

export default async function AdminDataQualityPage() {
  const dqData = await getDataQualityFromJson();
  return <AdminDataQualityTabsClient dqData={dqData} />;
}
