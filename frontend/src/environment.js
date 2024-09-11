let IS_PROD = true;
const server = IS_PROD ?
    "http://localhost:8000" :

    "http://localhost:3000"


export default server;