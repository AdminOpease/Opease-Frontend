/**
 * Apply pagination to a Knex query
 * @param {object} query - Knex query builder
 * @param {object} params - { page, limit }
 * @returns {object} { data, pagination: { page, limit, total, totalPages } }
 */
export async function paginate(query, { page = 1, limit = 50 } = {}) {
  page = Math.max(1, parseInt(page) || 1);
  limit = Math.min(100, Math.max(1, parseInt(limit) || 50));
  const offset = (page - 1) * limit;

  // Clone query for count
  const countQuery = query.clone().clearSelect().clearOrder().count('* as total').first();
  const [{ total }, data] = await Promise.all([
    countQuery,
    query.limit(limit).offset(offset),
  ]);

  return {
    data,
    pagination: {
      page,
      limit,
      total: parseInt(total),
      totalPages: Math.ceil(parseInt(total) / limit),
    },
  };
}
