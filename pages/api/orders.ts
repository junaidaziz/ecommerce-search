import type { NextApiRequest, NextApiResponse } from 'next';
import {
  addOrder,
  getOrdersForUser,
  getAllOrders,
  getOrdersForVendor,
} from '@lib/orders';
import { findUser } from '@lib/users';
import {
  getProductByUuid,
  decreaseProductQuantity,
  clearCart,
} from '@lib/db';
import { withRole } from '@lib/withRole';
import { sendOrderConfirmation } from '@lib/email';
import { handleApiError } from '@utils/handleApiError';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import type { Order, OrderPlacedResponse, ApiMessage } from '../../types';
import formidable, { type Fields, type Files, type File } from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function parseBody(
  req: NextApiRequest
): Promise<{ fields: Fields; files: Files }> {
  const type = req.headers['content-type'] || '';
  if (type.includes('application/json')) {
    const buffers: Uint8Array[] = [];
    for await (const chunk of req) buffers.push(chunk);
    const body = Buffer.concat(buffers).toString();
    return { fields: JSON.parse(body || '{}') as Fields, files: {} as Files };
  }
  return new Promise<{ fields: Fields; files: Files }>((resolve, reject) => {
    const form = formidable({ multiples: true });
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Order[] | OrderPlacedResponse | ApiMessage>
): Promise<void> {
  try {
    if (req.method === 'POST') {
      const { fields, files } = await parseBody(req);
      const email = fields.email as string;
      const items = fields.items ? JSON.parse(String(fields.items)) : [];
      const total = fields.total ? parseFloat(String(fields.total)) : 0;
      const paymentMethod = fields.paymentMethod as string | undefined;
      const paymentReference = fields.paymentReference as string | undefined;
      let paymentProofPath: string | undefined = undefined;
      const proof = files.paymentProof as File | File[] | undefined;
      if (proof) {
        const file = Array.isArray(proof) ? proof[0] : proof;
        const dir = path.join(process.cwd(), 'public', 'payment-proofs');
        fs.mkdirSync(dir, { recursive: true });
        const name = Date.now() + '-' + file.originalFilename;
        const dest = path.join(dir, name);
        fs.renameSync(file.filepath, dest);
        paymentProofPath = `/payment-proofs/${name}`;
      }
      if (!email || !items) {
        return res.status(400).json({ message: 'email and items required' });
      }

      for (const item of items) {
        const product = await getProductByUuid(String(item.uuid || item.id));
        if (!product) {
          return res.status(404).json({ message: 'Product not found' });
        }
        if ((product.quantity || 0) < item.qty) {
          return res
            .status(409)
            .json({ message: `Insufficient stock for ${product.title}` });
        }
      }

      for (const item of items) {
        await decreaseProductQuantity(String(item.uuid || item.id), item.qty);
      }

      const orders = await addOrder({
        userEmail: email,
        items,
        total: total || 0,
        paymentMethod,
        paymentReference,
        paymentProof: paymentProofPath,
      });
      const orderId =
        Array.isArray(orders) && orders.length > 0 ? orders[0].id : '';
      await clearCart(email);
      await sendOrderConfirmation(email, { id: orderId });
      return res.status(201).json({ message: 'order placed', id: orderId });
    }

    if (req.method === 'GET') {
      const session = await getServerSession(req, res, authOptions);
      const email = session?.user?.email;
      if (!email) return res.status(401).json({ message: 'Unauthorized' });
      const user = await findUser(email);
      if (!user) return res.status(404).json({ message: 'user not found' });
      if (user.role === 'SUPER_ADMIN') {
        return res.status(200).json(await getAllOrders());
      }
      if (user.role === 'BRAND') {
        return res.status(200).json(await getOrdersForVendor(user.brandName));
      }
      return res.status(200).json(await getOrdersForUser(email));
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    return handleApiError(res, error, 'Failed to process orders');
  }
}

export default withRole(['USER', 'BRAND', 'SUPER_ADMIN'])(handler);
