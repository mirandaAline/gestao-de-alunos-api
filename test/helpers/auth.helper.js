export async function loginAsAdmin(request, app, credentials) {
  const response = await request(app)
    .post('/api/auth/login')
    .send(credentials);

  return response.body.token;
}

export async function loginAsAluno(request, app, credentials) {
  const response = await request(app)
    .post('/api/auth/login')
    .send(credentials);

  return response.body.token;
}
