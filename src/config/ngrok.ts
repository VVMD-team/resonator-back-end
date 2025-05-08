import { PORT } from "const";

const ngrokConfig = {
  addr: PORT,
  compression: true,
  authtoken: process.env.NGROK_AUTHTOKEN as string,
  // domain: "resonator.ngrok.io",
  domain: "dapp-backend.ngrok.io",
  onLogEvent: (data: any) => {
    console.log("ngrok:", data);
  },
};

export default ngrokConfig;
