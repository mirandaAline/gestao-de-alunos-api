import request from 'supertest';
import { expect } from 'chai';
import mongoose from 'mongoose';

import app from '../src/app.js';
import { seed } from '../src/database/seed.js';
import testData from './fixtures/alunos-trabalhos.json' with { type: 'json' };
import { loginAsAdmin, loginAsAluno } from './helpers/auth.helper.js';

describe('Fluxo de aluno e trabalho', () => {
  before(async () => {
    await mongoose.connection.dropDatabase();
    await seed();
  });

  testData.forEach(({ admin, aluno, disciplinaId, trabalho }) => {
    it(`deve cadastrar ${aluno.nome}, logar como aluno e registrar um trabalho`, async () => {
      const adminToken = await loginAsAdmin(request, app, admin);

      expect(adminToken).to.be.a('string').and.not.to.be.empty;

      const cadastroAluno = await request(app)
        .post('/api/admin/alunos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(aluno);

      expect(cadastroAluno.status).to.equal(201);
      expect(cadastroAluno.body).to.include({
        nome: aluno.nome,
        email: aluno.email,
        matricula: aluno.matricula,
        role: 'aluno',
      });
      expect(cadastroAluno.body).to.not.have.property('senha');

      const alunoId = cadastroAluno.body.id;

      const matricula = await request(app)
        .post(`/api/admin/disciplinas/${disciplinaId}/matriculas`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ alunoId });

      expect(matricula.status).to.equal(201);
      expect(matricula.body).to.include({ alunoId, disciplinaId });

      const alunoToken = await loginAsAluno(request, app, {
        email: aluno.email,
        senha: aluno.senha,
      });

      expect(alunoToken).to.be.a('string').and.not.to.be.empty;

      const entrega = await request(app)
        .post(`/api/alunos/${alunoId}/trabalhos`)
        .set('Authorization', `Bearer ${alunoToken}`)
        .send({ disciplinaId, ...trabalho });

      expect(entrega.status).to.equal(201);
      expect(entrega.body).to.include({
        alunoId,
        disciplinaId,
        titulo: trabalho.titulo,
        descricao: trabalho.descricao,
        status: 'entregue',
      });
    });
  });
});
