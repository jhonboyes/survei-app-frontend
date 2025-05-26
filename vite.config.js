import {defineConfig} from "vite"
import react from "@vitejs/plugin-react-swc"

// https://vite.dev/config/
// export default defineConfig({
//  plugins: [react()],
//  server: {
//   port: 3002,
//   proxy: {
//    "/api": {
//     target: "http://localhost:3001",
//     changeOrigin: true,
//     secure: false
//    }
//   }
//  }
// })

export default defineConfig({
 plugins: [react()],
 server: {
  port: 3002,
  proxy: {
   "/api": {
    target: process.env.VITE_BASE_URL,
    changeOrigin: true,
    secure: false
   }
  }
 }
})
