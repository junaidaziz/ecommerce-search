import type { NextApiRequest, NextApiResponse } from 'next';
import { getOrderByUuid } from '../../../../lib/orders';
import { generateInvoice } from '../../../../lib/invoice';
import { handleApiError } from '../../../../lib/utils/handleApiError';
import { getQueryParam } from '../../../../lib/utils/getQueryParam';
import { withRole } from '../../../../lib/withRole';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const uuid = getQueryParam(req.query.uuid);
    if (!uuid) return res.status(400).json({ message: 'uuid required' });
    const order = await getOrderByUuid(uuid);
    if (!order) return res.status(404).json({ message: 'Not found' });
    const pdf = generateInvoice(order);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${uuid}.pdf"`);
    return res.status(200).end(pdf);
  } catch (e) {
    return handleApiError(res, e, 'Failed to generate invoice');
  }
}

export default withRole(['USER', 'BRAND', 'SUPER_ADMIN'])(handler);
