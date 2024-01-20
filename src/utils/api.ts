import ky from "ky";

export const api = ky.extend({
  hooks: {
    beforeError: [
      (err) => {
        if (err.response.status === 401) {
          window.location.href = "/login";
        }
        return err;
      },
    ],
  },
});
