import { telanganaData } from "./telangana";
import { goaData } from "./goa";

// Export individual state data
export { goaData, telanganaData };

// Export combined India data
export const indiaData = {
  "Andhra Pradesh": {},
  "Arunachal Pradesh": {},
  "Assam": {},
  "Bihar": {},
  "Chhattisgarh": {},
  "Goa": goaData,
  "Gujarat": {},
  "Haryana": {},
  "Himachal Pradesh": {},
  "Jharkhand": {},
  "Karnataka": {},
  "Kerala": {},
  "Madhya Pradesh": {},
  "Maharashtra": {},
  "Manipur": {},
  "Meghalaya": {},
  "Mizoram": {},
  "Nagaland": {},
  "Odisha": {},
  "Punjab": {},
  "Rajasthan": {},
  "Sikkim": {},
  "Tamil Nadu": {},
  "Telangana": telanganaData,
  "Tripura": {},
  "Uttar Pradesh": {},
  "Uttarakhand": {},
  "West Bengal": {},
  // Union Territories
  "Andaman and Nicobar Islands": {},
  "Chandigarh": {},
  "Dadra and Nagar Haveli and Daman and Diu": {},
  "Delhi": {},
  "Jammu and Kashmir": {},
  "Ladakh": {},
  "Lakshadweep": {},
  "Puducherry": {}
}; 