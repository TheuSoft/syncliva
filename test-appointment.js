// Script de teste para criar agendamento diretamente no banco
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');

// Conectar com o banco
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:123@localhost:5432/postgres';
const sql = postgres(connectionString);
const db = drizzle(sql);

async function testAppointment() {
  try {
    console.log('🔍 Testando criação de agendamento...');
    
    // Dados de teste
    const appointmentData = {
      patientId: '94ba125e-1600-4d43-a990-79a7f8d6cc41', // ID de um paciente existente
      doctorId: 'f223f5c2-f36f-4a5c-a9a0-0cb63d07b944', // ID do médico que aparece nos logs
      clinicId: 'd0df3961-59dc-427b-8d10-773273b3383a', // ID da clínica que aparece nos logs
      date: new Date('2025-07-31T10:00:00'),
      appointmentPriceInCents: 50000,
      status: 'pending'
    };
    
    console.log('📝 Dados do agendamento:', appointmentData);
    
    // Inserir diretamente no banco
    const result = await db.insert(appointmentsTable).values(appointmentData).returning();
    
    console.log('✅ Agendamento criado com sucesso:', result);
    
    sql.end();
  } catch (error) {
    console.error('❌ Erro ao criar agendamento:', error);
    sql.end();
  }
}

testAppointment();
