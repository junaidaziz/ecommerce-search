import type { NextApiRequest, NextApiResponse } from 'next';
import { getOrderByUuid } from '@lib/orders';
import { generateInvoice } from '@lib/invoice';
import { handleApiError } from '@utils/handleApiError';
import { getQueryParam } from '@utils/getQueryParam';
import { withRole } from '@lib/withRole';
import { NOT_FOUND, UUID_REQUIRED } from '@/constants/messages';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const uuid = getQueryParam(req.query.uuid);
    if (!uuid) return res.status(400).json({ message: UUID_REQUIRED });
    const order = await getOrderByUuid(uuid);
    if (!order) return res.status(404).json({ message: NOT_FOUND });
    const pdf = generateInvoice(order);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="invoice-${uuid}.pdf"`
    );
    return res.status(200).end(pdf);
  } catch (e) {
    return handleApiError(res, e, 'Failed to generate invoice');
  }
}

export default withRole(['USER', 'BRAND', 'SUPER_ADMIN'])(handler);
