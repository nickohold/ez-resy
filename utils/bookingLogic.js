import axios from "axios";
import FormData from "form-data";
import { slotParser } from "./slotParser.js";
import { convertDateToLongFormat } from "./helpers.js";
import {
  existingReservationConfig,
  slotConfig,
  bookingConfig,
  finalConfig,
} from "../config.js";
import { log } from "./logger.js";
// First, we'll see if we already have a reservation
async function checkForExistingBooking() {
  let config = existingReservationConfig(process.env.AUTH_TOKEN);
  let venueId = process.env.VENUE_ID;
  try {
    const response = await axios.request(config);
    if (response.data.reservations[0]?.venue?.id == venueId) {
      log(`You already have a reservation for tonight!`);
      return true;
    } else {
      log(`No existing reservation found.`);
      return false;
    }
  } catch (error) {
    log(error);
  }
}

// Then, we'll check to see if there are any reservations available
async function fetchDataAndParseSlots() {
  let currentPartySize = parseInt(process.env.PARTY_SIZE);
  const minPartySize = 2;

  while (currentPartySize >= minPartySize) {
    try {
      const config = { ...slotConfig };
      config.url = `https://api.resy.com/4/find?lat=0&long=0&day=${process.env.DATE}&party_size=${currentPartySize}&venue_id=${process.env.VENUE_ID}`;
      
      const response = await axios.request(config);
      // is the venue open for reservations at the date and time we're checking?
      if (response.data.results.venues.length === 0) {
        log(
          `The venue is not open for reservations on ${convertDateToLongFormat(process.env.DATE)}.`,
        );
        currentPartySize--;
        return false;
      }
      if (response.data.results.venues.length === 0) {
        log(
          `No slots available for party of ${currentPartySize}. Trying ${currentPartySize - 1}...`,
        );
        currentPartySize--;
        continue;
      }

      log(
        `Checking for reservations at ${
          response.data.results.venues[0].venue.name
        } on ${convertDateToLongFormat(process.env.DATE)} for ${currentPartySize} people...`,
      );
      
      let slots = response.data.results.venues[0].slots;
      const slotId = await slotParser(slots);
      
      if (slotId) {
        // If we found a slot with a smaller party size, update the party size for the booking
        process.env.PARTY_SIZE = currentPartySize.toString();
        return slotId;
      }
      
      currentPartySize--;
    } catch (error) {
      log(error);
      currentPartySize--;
    }
  }

  log("No slots available for any party size between 2 and original request.");
  return false;
}

// If there are reservations available, we'll grab the booking token
async function getBookingConfig(slotId) {
  try {
    const response = await axios.request(bookingConfig(slotId));
    return response.data.book_token.value;
  } catch (error) {
    log(error);
  }
}

// Finally, we'll make the reservation
async function makeBooking(book_token) {
  let config = finalConfig(process.env.AUTH_TOKEN);
  const formData = new FormData();
  formData.append(
    "struct_payment_method",
    JSON.stringify({ id: process.env.PAYMENT_ID }),
  );
  formData.append("book_token", book_token);
  formData.append("source_id", "resy.com-venue-details");
  formData.append("party_size", process.env.PARTY_SIZE);

  try {
    const response = await axios.post(config.url, formData, {
      headers: {
        ...config.headers,
        ...formData.getHeaders(),
      },
    });
    return response.data;
  } catch (error) {
    log(error.response.data);
  }
}

export {
  checkForExistingBooking,
  fetchDataAndParseSlots,
  getBookingConfig,
  makeBooking,
};
