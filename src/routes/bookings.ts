const getBookingsUrl = "/api/Bookings/";

export const getBookings = async (env: Env) =>
  (
    await fetch(env.BOOKING_API_URL + getBookingsUrl + env.BOOKING_API_KEY)
  ).json();

export const listBookings = async (request: Request, env: Env) => {
  const u = new URL(request.url);
  const secret = u.searchParams.get("secret");

  if (secret !== env.BOOKING_SECRET)
    return new Response(JSON.stringify({ error: "invalid_secret" }));

  const bookings = await getBookings(env);
  return new Response(JSON.stringify(bookings));
};

export const sendBookingInvoice = async (request: Request, env: Env) => {};
