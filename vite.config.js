import {defineConfig} from 'vite';
export default defineConfig({esbuild:{jsx:'automatic'},server:{host:'0.0.0.0',port:4173,allowedHosts:['terminal.local'],proxy:{'/api':{target:'http://localhost:3001',changeOrigin:true,rewrite:path=>path.replace(/^\/api/,'')}}}});
