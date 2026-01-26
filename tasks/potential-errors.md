# Potencjalne błędy w kodzie Family Coin

## 🔒 Problemy bezpieczeństwa

### 1. Brak walidacji odbiorcy przelewu
**Plik:** `lib/hooks/useCoinTransfer.ts`
**Problem:** Brak sprawdzenia czy użytkownik nie przesyła pieniędzy samemu sobie
**Ryzyko:** Użytkownik może "przesłać" pieniądze sam sobie, co może być wykorzystane do manipulacji systemem
**Linia:** ~40-61

### 2. Brak limitów transakcyjnych
**Plik:** `lib/hooks/useCoinTransfer.ts`
**Problem:** Brak maksymalnego limitu pojedynczej transakcji ani dziennego limitu
**Ryzyko:** Możliwość przeprowadzenia dużych transakcji bez ograniczeń
**Linia:** ~18-23

### 3. Brak rate limiting
**Plik:** `components/Modal.tsx`, `lib/hooks/useCoinTransfer.ts`
**Problem:** Brak ograniczeń liczby transakcji w czasie
**Ryzyko:** Możliwość ataku typu DoS poprzez wielokrotne transakcje

### 4. Walidacja danych wejściowych
**Plik:** `components/InputGroup.tsx`
**Problem:** Nieprawidłowe użycie react-hook-form - `register(name).onChange(e)` zamiast `register(name, rules)`
**Ryzyko:** Błędy walidacji, potencjalne XSS przez nieprawidłowe sanitizowanie inputów
**Linia:** 34-37

## 💰 Problemy z logiką przelewów pieniężnych

### 5. Problem z typami w transakcjach
**Plik:** `lib/hooks/useCoinTransfer.ts`
**Problem:** `Number(toUserData.balance) + Number(numericAmount)` - toUserData.balance może być undefined
**Ryzyko:** NaN w wyniku transakcji, nieprawidłowe salda
**Linia:** 56

### 6. Brak atomowości w sprawdzaniu salda
**Plik:** `lib/hooks/useCoinTransfer.ts`
**Problem:** Sprawdzenie salda przed transakcją nie jest atomowe z samą transakcją
**Ryzyko:** Race condition - dwóch użytkowników może sprawdzić saldo jednocześnie i wykonać transakcję
**Linia:** 25-33

### 7. Błędne wyświetlanie waluty
**Plik:** `components/User.tsx`
**Problem:** Znak `Æ` zamiast poprawnej jednostki waluty (Family Coin)
**Ryzyko:** Nieprawidłowe wyświetlanie salda użytkowników
**Linia:** 18

### 8. Brak obsługi błędów w hookach
**Plik:** `lib/hooks/useUsers.ts`, `lib/hooks/useCurrentUserDocument.ts`
**Problem:** Brak error handling w hookach pobierających dane
**Ryzyko:** Aplikacja może się zawiesić przy problemach z siecią/Firestore

## 🎨 Problemy UI/UX

### 9. Nieprawidłowe mapowanie w Users
**Plik:** `components/Users.tsx`
**Problem:** `users.map()` bez key dla null elementów może powodować warningi React
**Ryzyko:** Ostrzeżenia w konsoli, potencjalne problemy z wydajnością
**Linia:** 21-31

### 10. Brak loading states
**Plik:** `lib/hooks/useUsers.ts`, `lib/hooks/useCurrentUserDocument.ts`
**Problem:** Brak loading state w hookach pobierających dane użytkowników
**Ryzyko:** Puste listy użytkowników podczas ładowania

### 11. Nieaktualne dane użytkowników
**Plik:** `lib/hooks/useUsers.ts`
**Problem:** Używa `getDocs` zamiast `onSnapshot` - dane nie aktualizują się w czasie rzeczywistym
**Ryzyko:** Użytkownicy nie widzą aktualnych danych innych użytkowników
**Linia:** 14-28

### 12. Brak walidacji formularza przelewu
**Plik:** `components/Modal.tsx`
**Problem:** Brak sprawdzenia czy amount > 0 przed wysłaniem formularza
**Ryzyko:** Próba przesłania 0 lub ujemnej kwoty
**Linia:** 21-29

### 13. Nieprawidłowe ID dialogu
**Plik:** `components/Modal.tsx`
**Problem:** Użycie `id` użytkownika jako `id` elementu dialog - może zawierać specjalne znaki
**Ryzyko:** Problemy z CSS selektorami lub JavaScript
**Linia:** 55

## 🔄 Problemy z danymi i stanem aplikacji

### 14. useCurrentUserDocument nie zwraca UID
**Plik:** `lib/hooks/useCurrentUserDocument.ts`
**Problem:** Hook zwraca tylko dane dokumentu, ale komponenty używają `currentUserDoc.uid`
**Ryzyko:** Błąd runtime - undefined uid
**Użycie:** `app/page.tsx:16`, `components/Users.tsx:12`

### 15. Brak aktualizacji danych bieżącego użytkownika
**Plik:** `lib/hooks/useCurrentUserDocument.ts`
**Problem:** Używa `getDoc` zamiast `onSnapshot` - dane nie aktualizują się gdy saldo się zmieni
**Ryzyko:** Nieaktualne wyświetlanie własnego salda po transakcjach

### 16. Nieobsługiwane pola użytkownika
**Plik:** `app/logowanie/page.tsx`
**Problem:** Tworzone są pola `isApproved` i `isAdmin` ale nie są używane w aplikacji
**Ryzyko:** Martwy kod, potencjalne problemy z bezpieczeństwem

## ⚡ Problemy wydajnościowe

### 17. Brak memoizacji komponentów
**Plik:** Większość komponentów
**Problem:** Brak `React.memo` dla komponentów renderowanych w pętlach
**Ryzyko:** Niepotrzebne re-renderowanie przy każdej zmianie stanu

### 18. Brak optymalizacji hooków
**Plik:** `lib/hooks/useUserBalance.ts`
**Problem:** Hook zawsze nasłuchuje zmian w Firestore, nawet gdy komponent nie jest widoczny
**Ryzyko:** Niepotrzebne zapytania do bazy danych

## 🎭 Problemy z dostępnością (Accessibility)

### 19. Brak ARIA labels
**Plik:** `components/Modal.tsx`
**Problem:** Modal nie ma odpowiednich ARIA atrybutów dla czytników ekranowych
**Linia:** 55-89

### 20. Brak focus management
**Plik:** `components/Modal.tsx`
**Problem:** Brak zarządzania focusem przy otwieraniu/zamykaniu modalu
**Ryzyko:** Problemy z nawigacją klawiszową

## 🔧 Problemy techniczne

### 21. Nieprawidłowe użycie React Hook Form
**Plik:** `components/InputGroup.tsx`
**Problem:** Podwójne wywołanie onChange - zarówno dla react-hook-form jak i custom onChange
**Ryzyko:** Nieprawidłowe zachowanie formularza, konflikty stanu

### 22. Zbędne importy React
**Plik:** `components/Wallet.tsx`, `components/Header.tsx` i inne
**Problem:** Import React nie jest potrzebny w komponentach używających JSX Transform
**Ryzyko:** Nieznaczne zwiększenie bundle size

### 23. Brak TypeScript strict mode dla props
**Plik:** `components/User.tsx`
**Problem:** Props oznaczone jako opcjonalne `?` ale używane bez sprawdzenia undefined
**Linia:** 4-9

## 🎯 Problemy z logowaniem/rejestracją

### 24. Brak sprawdzenia duplikatów kont
**Plik:** `app/logowanie/page.tsx`
**Problem:** Brak sprawdzenia czy użytkownik jest już zalogowany podczas tworzenia konta
**Ryzyko:** Wielokrotne tworzenie kont dla tego samego użytkownika
**Linia:** 26-43

### 25. Brak walidacji danych rejestracji
**Plik:** `app/logowanie/page.tsx`
**Problem:** Brak walidacji email/displayName podczas tworzenia konta
**Ryzyko:** Nieprawidłowe dane w bazie

## 📱 Problemy responsywności

### 26. Brak testów responsywności
**Plik:** Wszystkie komponenty UI
**Problem:** Brak sprawdzenia jak aplikacja wygląda na różnych urządzeniach
**Ryzyko:** Zła użyteczność na mobilnych

## 🧪 Problemy z testowalnością

### 27. Brak testów
**Problem:** Brak jakiejkolwiek konfiguracji testów (choć wspomniana w AGENTS.md)
**Ryzyko:** Trudności w wychwytywaniu regresji

### 28. Hooki trudne do testowania
**Plik:** Wszystkie hooki Firebase
**Problem:** Hooki bezpośrednio używają Firebase, trudność w mockowaniu
**Ryzyko:** Problemy z testowaniem logiki biznesowej</content>
<parameter name="filePath">tasks/potential-errors.md