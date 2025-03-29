import { telanganaData } from "./telangana";
import { goaData } from "./goa";

// Export individual state data
export { goaData, telanganaData };

// Export combined India data
export const indiaData = {
  "Telangana": telanganaData,
  "Goa": goaData
}; 