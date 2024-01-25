"use server";

export async function getLocation(latitude: number, longitude: number) {
  try {
    const res = await fetch(
      `https://us1.locationiq.com/v1/reverse?key=${process.env.LOCATION_IQ_KEY}&lat=${latitude}&lon=${longitude}&format=json`,
    );
    const data = await res.json();
    const adress = `${data.address.road}, ${
      data.address.suburb || data.address.county
    }, ${data.address.postcode} ${data.address.city || data.address.village}, ${
      data.address.country
    }`;
    return adress;
  } catch (error) {
    console.error(error);
    return "";
  }
}
