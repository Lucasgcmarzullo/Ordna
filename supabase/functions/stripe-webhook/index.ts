// Supabase Edge Function: stripe-webhook
// Deploy: supabase functions deploy stripe-webhook

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
})

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  
  if (!signature) {
    return new Response(
      JSON.stringify({ error: 'No signature' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    const body = await req.text()
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''

    // Verificar assinatura do webhook
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    )

    console.log('Webhook recebido:', event.type)

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Processar eventos
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const email = session.customer_email || session.customer_details?.email
        
        if (!email) {
          console.error('Email não encontrado no evento')
          break
        }

        console.log(`Checkout completo para: ${email}`)

        // Atualizar usuário para premium
        const { error } = await supabase
          .from('users')
          .update({ 
            is_premium: true,
            updated_at: new Date().toISOString()
          })
          .eq('email', email)

        if (error) {
          console.error('Erro ao atualizar usuário:', error)
        } else {
          console.log(`✅ Usuário ${email} atualizado para premium`)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object
        const customerId = subscription.customer
        
        // Buscar email do cliente
        const customer = await stripe.customers.retrieve(customerId)
        const email = customer.email
        
        if (!email) {
          console.error('Email não encontrado no cliente')
          break
        }

        const isActive = subscription.status === 'active'
        console.log(`Assinatura ${isActive ? 'ativa' : 'inativa'} para: ${email}`)

        // Atualizar status premium
        const { error } = await supabase
          .from('users')
          .update({ 
            is_premium: isActive,
            updated_at: new Date().toISOString()
          })
          .eq('email', email)

        if (error) {
          console.error('Erro ao atualizar usuário:', error)
        } else {
          console.log(`✅ Status premium de ${email} atualizado para ${isActive}`)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        const customerId = subscription.customer
        
        // Buscar email do cliente
        const customer = await stripe.customers.retrieve(customerId)
        const email = customer.email
        
        if (!email) {
          console.error('Email não encontrado no cliente')
          break
        }

        console.log(`Assinatura cancelada para: ${email}`)

        // Remover premium
        const { error } = await supabase
          .from('users')
          .update({ 
            is_premium: false,
            updated_at: new Date().toISOString()
          })
          .eq('email', email)

        if (error) {
          console.error('Erro ao atualizar usuário:', error)
        } else {
          console.log(`✅ Premium removido de ${email}`)
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object
        const customerId = invoice.customer
        
        // Buscar email do cliente
        const customer = await stripe.customers.retrieve(customerId)
        const email = customer.email
        
        if (!email) {
          console.error('Email não encontrado no cliente')
          break
        }

        console.log(`Pagamento bem-sucedido para: ${email}`)

        // Garantir que está premium
        const { error } = await supabase
          .from('users')
          .update({ 
            is_premium: true,
            updated_at: new Date().toISOString()
          })
          .eq('email', email)

        if (error) {
          console.error('Erro ao atualizar usuário:', error)
        } else {
          console.log(`✅ Premium confirmado para ${email}`)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object
        const customerId = invoice.customer
        
        // Buscar email do cliente
        const customer = await stripe.customers.retrieve(customerId)
        const email = customer.email
        
        if (!email) {
          console.error('Email não encontrado no cliente')
          break
        }

        console.log(`Pagamento falhou para: ${email}`)

        // Remover premium após falha de pagamento
        const { error } = await supabase
          .from('users')
          .update({ 
            is_premium: false,
            updated_at: new Date().toISOString()
          })
          .eq('email', email)

        if (error) {
          console.error('Erro ao atualizar usuário:', error)
        } else {
          console.log(`✅ Premium removido de ${email} (pagamento falhou)`)
        }
        break
      }

      default:
        console.log(`Evento não tratado: ${event.type}`)
    }

    return new Response(
      JSON.stringify({ received: true }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    )
  } catch (err) {
    console.error('Erro no webhook:', err.message)
    return new Response(
      JSON.stringify({ error: err.message }),
      { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      }
    )
  }
})
