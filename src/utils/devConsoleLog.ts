export const devConsoleLog = (string: String) => {
  !process.env.VERCEL_ENV && console.log(string);
};
