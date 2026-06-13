$body = @{
    email = "michaelrsmith2002@protonmail.com"
    password = "Awesome0931@"
    data = @{
        first_name = "Michael"
        last_name = "Smith"
        account_type = "operator"
        subscription_tier = "enterprise"
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://qwcerhqlcardgazpzney.supabase.co/auth/v1/signup" `
  -Method Post `
  -Headers @{
      "apikey" = "sb_publishable_uwrCUl9d9zruqc_SeJ0t6g_Q5ki-czj"
      "Content-Type" = "application/json"
  } `
  -Body $body
