// Barrel — import query helpers grouped by table.
//
//   import { contacts, appointments, agents } from "@/lib/db/queries";
//   const rows = await withOrgContext(orgId, (tx) =>
//     contacts.getByOrg(tx),
//   );

import * as contacts from "./contacts";
import * as appointments from "./appointments";
import * as proposals from "./proposals";
import * as deals from "./deals";
import * as agents from "./agents";
import * as briefs from "./briefs";
import * as signals from "./signals";
import * as businessProfile from "./business-profile";

export { contacts, appointments, proposals, deals, agents, briefs, signals, businessProfile };
