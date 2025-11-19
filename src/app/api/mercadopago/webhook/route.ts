import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-signature');
    const requestId = request.headers.get('x-request-id');

    // Validar assinatura do webhook
    const webhookSecret = process.env.MP_WEBHOOK_SECRET;
    
    if (webhookSecret && signature) {
      const parts = signature.split(',');
      const ts = parts.find(p => p.startsWith('ts='))?.split('=')[1];
      const hash = parts.find(p => p.startsWith('v1='))?.split('=')[1];

      if (ts && hash) {
        const manifest = `id:${requestId};request-id:${requestId};ts:${ts};`;
        const hmac = crypto.createHmac('sha256', webhookSecret);
        hmac.update(manifest);
        const expectedHash = hmac.digest('hex');

        if (expectedHash !== hash) {
          return NextResponse.json(
            { success: false, message: 'Assinatura inválida' },
            { status: 401 }
          );
        }
      }
    }

    const data = JSON.parse(body);

    // Processar notificação de assinatura
    if (data.type === 'subscription_preapproval' || data.action === 'payment.created') {
      const subscriptionId = data.data?.id;

      if (!subscriptionId) {
        return NextResponse.json(
          { success: false, message: 'ID da assinatura não encontrado' },
          { status: 400 }
        );
      }

      // Buscar detalhes da assinatura
      const accessToken = process.env.MP_ACCESS_TOKEN;
      const response = await fetch(`https://api.mercadopago.com/preapproval/${subscriptionId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const subscription = await response.json();
      const status = subscription.status;
      const payerEmail = subscription.payer_email;

      if (!payerEmail) {
        return NextResponse.json(
          { success: false, message: 'Email do pagador não encontrado' },
          { status: 400 }
        );
      }

      // Atualizar status premium no Supabase
      let isPremium = false;

      if (status === 'authorized' || status === 'approved') {
        isPremium = true;
      } else if (['paused', 'cancelled', 'expired', 'rejected'].includes(status)) {
        isPremium = false;
      }

      // Atualizar usuário no Supabase
      const { error } = await supabase
        .from('users')
        .update({ is_premium: isPremium })
        .eq('email', payerEmail);

      if (error) {
        console.error('Erro ao atualizar Supabase:', error);
        return NextResponse.json(
          { success: false, message: 'Erro ao atualizar status premium' },
          { status: 500 }
        );
      }

      const message = isPremium ? 'Premium ativado com sucesso' : 'Premium cancelado';

      return NextResponse.json({
        success: true,
        message,
        data: {
          email: payerEmail,
          status,
          isPremium,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook recebido',
    });
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro ao processar webhook',
        data: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
