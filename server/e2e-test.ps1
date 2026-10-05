$ErrorActionPreference = 'Stop'
$base = 'http://localhost:3000'

function Post($path, $body, $token) {
  $h = @{}
  if ($token) { $h['Authorization'] = 'Bearer ' + $token }
  return Invoke-RestMethod -Uri ($base + $path) -Method Post -ContentType 'application/json' -Headers $h -Body ($body | ConvertTo-Json)
}
function Get2($path, $token) {
  $h = @{}
  if ($token) { $h['Authorization'] = 'Bearer ' + $token }
  return Invoke-RestMethod -Uri ($base + $path) -Method Get -Headers $h
}
function DeleteItem($path, $token) {
  $h = @{ Authorization = 'Bearer ' + $token }
  try {
    return Invoke-RestMethod -Uri ($base + $path) -Method Delete -Headers $h
  } catch {
    return "HTTP " + [int]$_.Exception.Response.StatusCode
  }
}

Write-Output '=== 1) register alice ==='
$a = Post '/api/auth/register' @{username='alice';password='secret1';nickname='Alice';wechat='alice_wx';phone='13800000001'}
$tokA = $a.token
Write-Output ("token=" + $tokA + " nickname=" + $a.user.nickname)

Write-Output '=== 2) duplicate register alice should fail ==='
try {
  Post '/api/auth/register' @{username='alice';password='secret1';nickname='x'}
  Write-Output '  !! duplicate registration unexpectedly succeeded'
} catch {
  Write-Output ('  rejected: HTTP ' + [int]$_.Exception.Response.StatusCode)
}

Write-Output '=== 3) register bob ==='
$b = Post '/api/auth/register' @{username='bob';password='secret2';nickname='Bob';wechat='bob_wx';phone='13800000002'}
$tokB = $b.token
Write-Output ("token=" + $tokB)

Write-Output '=== 4) wrong password login bob should fail ==='
try {
  Post '/api/auth/login' @{username='bob';password='wrong'}
  Write-Output '  !! wrong password unexpectedly logged in'
} catch {
  Write-Output ('  rejected: HTTP ' + [int]$_.Exception.Response.StatusCode)
}

Write-Output '=== 5) alice publishes a found item ==='
$item = Post '/api/items' @{category='found';itemName='black-wallet';locationTag='library';locationDetail='2nd-floor';time='2026-10-01';color='black';images=@();detail='has-campus-card';status='ongoing'} $tokA
$id = $item.item.id
Write-Output ("item id=" + $id + " publisherId=" + $item.item.publisherId)

Write-Output '=== 6) bob views plaza (should see alice item, shared) ==='
$plaza = Get2 '/api/items'
Write-Output ("plaza count=" + $plaza.items.Count + " first=" + $plaza.items[0].itemName)

Write-Output '=== 7) bob my-items (should be empty, isolated) ==='
$mineB = Get2 '/api/items/mine' $tokB
Write-Output ("bob mine count=" + $mineB.items.Count)

Write-Output '=== 8) alice my-items (should be 1) ==='
$mineA = Get2 '/api/items/mine' $tokA
Write-Output ("alice mine count=" + $mineA.items.Count)

Write-Output '=== 9) detail returns publisher card ==='
$d = Get2 ('/api/items/' + $id)
Write-Output ("publisher nickname=" + $d.publisher.nickname + " wechat=" + $d.publisher.wechat + " phone=" + $d.publisher.phone)

Write-Output '=== 10) bob deletes alice item (should 403) ==='
Write-Output ('  result: ' + (DeleteItem ('/api/items/' + $id) $tokB))

Write-Output '=== 11) alice deletes own item (should ok) ==='
Write-Output ('  result: ' + (DeleteItem ('/api/items/' + $id) $tokA))

Write-Output '=== 12) plaza after delete (should be 0) ==='
$plaza2 = Get2 '/api/items'
Write-Output ("plaza count=" + $plaza2.items.Count)
