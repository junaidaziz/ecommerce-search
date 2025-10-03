# Profile Settings - Code Snippets

## Quick Reference for Key Implementation Details

### 1. Address Model (Prisma Schema)

```prisma
// Added to prisma/schema.prisma

model User {
  // ... existing fields
  addresses Address[]  // NEW RELATION
}

model Address {
  id           Int      @id @default(autoincrement())
  uuid         String   @unique @default(uuid())
  userId       Int
  type         String   // "SHIPPING" or "BILLING"
  fullName     String
  addressLine1 String
  addressLine2 String?
  city         String
  state        String
  postalCode   String
  country      String
  phoneNumber  String?
  isDefault    Boolean  @default(false)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([type])
}
```

### 2. API Usage Examples

#### Get All Addresses
```typescript
// Client-side
const res = await apiFetch('/api/user/addresses');
const addresses = await res.json();
// Returns array of addresses, ordered by isDefault DESC, createdAt DESC
```

#### Create Address
```typescript
// Client-side
const newAddress = {
  type: 'SHIPPING',
  fullName: 'John Doe',
  addressLine1: '123 Main St',
  addressLine2: 'Apt 4B',
  city: 'New York',
  state: 'NY',
  postalCode: '10001',
  country: 'United States',
  phoneNumber: '+1 234 567 8900',
  isDefault: true,
};

const res = await apiFetch('/api/user/addresses', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(newAddress),
});
```

#### Update Address
```typescript
// Client-side
const updatedAddress = {
  // ... same fields as create
};

const res = await apiFetch(`/api/user/addresses?id=${addressId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(updatedAddress),
});
```

#### Delete Address
```typescript
// Client-side
const res = await apiFetch(`/api/user/addresses?id=${addressId}`, {
  method: 'DELETE',
});
```

### 3. Component Usage

#### ManageAddressSection Component
```tsx
// In settings.tsx or any page
import ManageAddressSection from '@components/Settings/ManageAddressSection';

function SettingsPage() {
  return (
    <div>
      {/* ... other content */}
      <ManageAddressSection />
    </div>
  );
}
```

#### UpdateProfileSection Component
```tsx
// In settings.tsx or any page
import UpdateProfileSection from '@components/Settings/UpdateProfileSection';

function SettingsPage() {
  return (
    <div>
      {/* ... other content */}
      <UpdateProfileSection />
    </div>
  );
}
```

### 4. TypeScript Types

```typescript
// types/address.ts
import type { Address as PrismaAddress } from '@prisma/client';

export type Address = PrismaAddress;

export type AddressInput = Omit<
  PrismaAddress,
  'id' | 'uuid' | 'userId' | 'createdAt' | 'updatedAt'
>;

export type AddressUpdate = Partial<AddressInput>;

export type AddressResponse = Address;

export type AddressSummary = Pick<
  PrismaAddress,
  | 'id'
  | 'uuid'
  | 'type'
  | 'fullName'
  | 'addressLine1'
  | 'addressLine2'
  | 'city'
  | 'state'
  | 'postalCode'
  | 'country'
  | 'phoneNumber'
  | 'isDefault'
>;
```

### 5. Database Queries (Server-side)

#### Get User's Addresses
```typescript
const addresses = await prisma.address.findMany({
  where: { userId },
  orderBy: [
    { isDefault: 'desc' },
    { createdAt: 'desc' }
  ],
});
```

#### Create Address with Default Management
```typescript
// If setting as default, unset other defaults
if (isDefault) {
  await prisma.address.updateMany({
    where: { 
      userId, 
      type, 
      isDefault: true 
    },
    data: { isDefault: false },
  });
}

// Create new address
const address = await prisma.address.create({
  data: {
    userId,
    type,
    fullName,
    addressLine1,
    addressLine2: addressLine2 || null,
    city,
    state,
    postalCode,
    country,
    phoneNumber: phoneNumber || null,
    isDefault: isDefault || false,
  },
});
```

#### Get Default Shipping Address
```typescript
const defaultShipping = await prisma.address.findFirst({
  where: { 
    userId, 
    type: 'SHIPPING',
    isDefault: true 
  },
});
```

#### Get Default Billing Address
```typescript
const defaultBilling = await prisma.address.findFirst({
  where: { 
    userId, 
    type: 'BILLING',
    isDefault: true 
  },
});
```

### 6. Form Validation Example

```typescript
// In ManageAddressSection.tsx
const addressForm = useForm<AddressFormValues>({
  defaultValues: {
    type: 'SHIPPING',
    isDefault: false,
  },
});

// Field with validation
<TextInput
  label="Full Name"
  placeholder="John Doe"
  register={addressForm.register}
  name="fullName"
  rules={{ required: 'Required' }}
  error={addressForm.formState.errors.fullName?.message}
/>

// Submit handler
const submitAddress: SubmitHandler<AddressFormValues> = async (values) => {
  setSavingAddress(true);
  try {
    const url = editingId
      ? `/api/user/addresses?id=${editingId}`
      : '/api/user/addresses';
    const method = editingId ? 'PUT' : 'POST';

    const res = await apiFetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    if (res.ok) {
      addNotification(
        editingId ? 'Address updated' : 'Address added',
        'success'
      );
      await loadAddresses();
    }
  } finally {
    setSavingAddress(false);
  }
};
```

### 7. Styling Examples

#### Address Card with Default Badge
```tsx
<div
  className={`p-4 rounded-lg border-2 transition-all ${
    address.isDefault
      ? 'border-primary bg-primary/5 dark:bg-primary/10'
      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
  }`}
>
  {address.isDefault && (
    <span className="inline-block px-2 py-1 text-xs font-semibold text-primary bg-primary/20 rounded-full mb-2">
      DEFAULT
    </span>
  )}
  {/* Address details */}
</div>
```

#### Responsive Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {addresses.map((address) => (
    <AddressCard key={address.id} address={address} />
  ))}
</div>
```

#### Button with Loading State
```tsx
<button
  type="submit"
  disabled={savingAddress}
  className="px-6 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
>
  {savingAddress ? (
    <>
      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      Saving...
    </>
  ) : (
    <>
      <CheckIcon className="w-4 h-4" />
      Save Address
    </>
  )}
</button>
```

### 8. Testing Examples

```typescript
// __tests__/addresses.api.test.ts

test('GET returns addresses list', async () => {
  (getServerSession as jest.Mock).mockResolvedValue(mockSession);
  (prisma.address.findMany as jest.Mock).mockResolvedValue(addresses);

  const json = jest.fn();
  const status = jest.fn(() => ({ json }));
  const req = { method: 'GET' } as any;
  const res = { status } as any;

  await handler(req, res);

  expect(status).toHaveBeenCalledWith(200);
  expect(json).toHaveBeenCalledWith(addresses);
});
```

### 9. Migration Script

```sql
-- prisma/migrations/20251003035123_add_address_model/migration.sql

CREATE TABLE "Address" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Address_uuid_key" ON "Address"("uuid");
CREATE INDEX "Address_userId_idx" ON "Address"("userId");
CREATE INDEX "Address_type_idx" ON "Address"("type");

ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "User"("id") 
  ON DELETE CASCADE ON UPDATE CASCADE;
```

### 10. Constants

```typescript
// constants/messages.ts
export const CREATED = 'Created';
export const DELETED = 'Deleted';
export const UPDATED = 'updated';
export const UNAUTHORIZED = 'Unauthorized';
export const NOT_FOUND = 'Not found';
export const METHOD_NOT_ALLOWED = 'Method Not Allowed';
```

## Integration with Checkout

### Example: Use Default Shipping Address
```typescript
async function getCheckoutAddress(userId: number) {
  const shippingAddress = await prisma.address.findFirst({
    where: {
      userId,
      type: 'SHIPPING',
      isDefault: true,
    },
  });

  if (!shippingAddress) {
    // Fallback to any shipping address
    return await prisma.address.findFirst({
      where: { userId, type: 'SHIPPING' },
    });
  }

  return shippingAddress;
}
```

### Example: Address Selection in Checkout
```typescript
function CheckoutForm() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

  useEffect(() => {
    // Load addresses
    apiFetch('/api/user/addresses')
      .then(res => res.json())
      .then(data => {
        setAddresses(data);
        // Auto-select default
        const defaultAddr = data.find(a => a.type === 'SHIPPING' && a.isDefault);
        if (defaultAddr) setSelectedAddressId(defaultAddr.id);
      });
  }, []);

  return (
    <div>
      <h3>Select Shipping Address</h3>
      {addresses
        .filter(a => a.type === 'SHIPPING')
        .map(address => (
          <label key={address.id}>
            <input
              type="radio"
              name="shipping"
              value={address.id}
              checked={selectedAddressId === address.id}
              onChange={() => setSelectedAddressId(address.id)}
            />
            {address.fullName} - {address.addressLine1}, {address.city}
            {address.isDefault && <span> (Default)</span>}
          </label>
        ))}
    </div>
  );
}
```

## Performance Optimization

### Indexed Queries
```typescript
// Both userId and type are indexed for fast queries
const shippingAddresses = await prisma.address.findMany({
  where: { 
    userId,      // Uses index
    type: 'SHIPPING'  // Uses index
  },
});
```

### Eager Loading in User Query
```typescript
const userWithAddresses = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    addresses: {
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    }
  }
});
```

This reference guide provides all the essential code snippets needed to understand, maintain, and extend the profile settings implementation.
