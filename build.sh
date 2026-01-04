sudo docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://spmb1.wempyaw.com \
  --build-arg NEXT_PUBLIC_APP_URL=https://spmb1.wempyaw.com \
  -t frontend-web-batik:latest .
