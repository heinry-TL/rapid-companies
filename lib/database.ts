import { supabaseAdmin } from './supabase';
import { getConnection } from './mysql';

export type DatabaseType = 'mysql' | 'supabase';

interface DatabaseStats {
  totalApplications: number;
  monthlyApplications: number;
  totalOrders: number;
  paidOrders: number;
  totalRevenue: number;
  monthlyOrders: number;
  monthlyRevenue: number;
  totalJurisdictions: number;
}

interface DatabaseOrder {
  id: number;
  order_id: string;
  stripe_payment_intent_id: string | null;
  customer_email: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  total_amount: number;
  currency: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: string | null;
  applications_count: number;
  services_count: number;
  order_items: any | null;
  stripe_metadata: any | null;
  created_at: string;
  paid_at: string | null;
  updated_at: string;
}

interface DatabaseOrdersResponse {
  orders: DatabaseOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class DatabaseService {
  private dbType: DatabaseType;

  constructor(dbType: DatabaseType = process.env.DATABASE_TYPE as DatabaseType || 'mysql') {
    this.dbType = dbType;
    console.log('🔍 DatabaseService constructor - Environment:', {
      DATABASE_TYPE: process.env.DATABASE_TYPE,
      dbType: this.dbType,
      NODE_ENV: process.env.NODE_ENV
    });
  }

  async getStats(): Promise<DatabaseStats> {
    if (this.dbType === 'supabase') {
      return this.getStatsSupabase();
    } else {
      return this.getStatsMySQL();
    }
  }

  async getOrders(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string
  ): Promise<DatabaseOrdersResponse> {
    if (this.dbType === 'supabase') {
      return this.getOrdersSupabase(page, limit, search, status);
    } else {
      return this.getOrdersMySQL(page, limit, search, status);
    }
  }

  async createOrder(orderData: any): Promise<DatabaseOrder> {
    if (this.dbType === 'supabase') {
      return this.createOrderSupabase(orderData);
    } else {
      return this.createOrderMySQL(orderData);
    }
  }

  async updateOrder(orderId: string, updates: any): Promise<DatabaseOrder> {
    if (this.dbType === 'supabase') {
      return this.updateOrderSupabase(orderId, updates);
    } else {
      return this.updateOrderMySQL(orderId, updates);
    }
  }

  async getOrderStatistics(): Promise<{
    statistics: any;
    recentOrders: any[];
    monthlyRevenue: any[];
  }> {
    if (this.dbType === 'supabase') {
      return this.getOrderStatisticsSupabase();
    } else {
      return this.getOrderStatisticsMySQL();
    }
  }

  async createOrderWithItems(orderData: any, applications: any[] = [], services: any[] = []): Promise<DatabaseOrder> {
    if (this.dbType === 'supabase') {
      return this.createOrderWithItemsSupabase(orderData, applications, services);
    } else {
      return this.createOrderWithItemsMySQL(orderData, applications, services);
    }
  }

  private async getStatsMySQL(): Promise<DatabaseStats> {
    let db;
    try {
      db = await getConnection();

      const [applicationsResult]: any = await db.execute(
        'SELECT COUNT(*) as total FROM applications'
      );
      const totalApplications = applicationsResult[0]?.total || 0;

      const [monthlyApplicationsResult]: any = await db.execute(
        'SELECT COUNT(*) as total FROM applications WHERE MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE())'
      );
      const monthlyApplications = monthlyApplicationsResult[0]?.total || 0;

      let orderStats = { total_orders: 0, paid_orders: 0, total_revenue: 0 };
      let monthlyOrderStats = { total_orders: 0, paid_orders: 0, revenue: 0 };

      try {
        const [orderStatsResult]: any = await db.execute(`
          SELECT
            COUNT(*) as total_orders,
            COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as paid_orders,
            COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END), 0) as total_revenue
          FROM orders
        `);
        orderStats = orderStatsResult[0] || orderStats;

        const [monthlyOrdersResult]: any = await db.execute(`
          SELECT
            COUNT(*) as total_orders,
            COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as paid_orders,
            COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END), 0) as revenue
          FROM orders
          WHERE MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE())
        `);
        monthlyOrderStats = monthlyOrdersResult[0] || monthlyOrderStats;
      } catch (ordersTableError) {
        console.log('Orders table not found in MySQL, using default values.');
      }

      const [jurisdictionsResult]: any = await db.execute(
        'SELECT COUNT(*) as total FROM jurisdictions'
      );
      const totalJurisdictions = jurisdictionsResult[0]?.total || 0;

      return {
        totalApplications,
        monthlyApplications,
        totalOrders: orderStats.total_orders,
        paidOrders: orderStats.paid_orders,
        totalRevenue: orderStats.total_revenue,
        monthlyOrders: monthlyOrderStats.total_orders,
        monthlyRevenue: monthlyOrderStats.revenue,
        totalJurisdictions,
      };
    } catch (error) {
      console.error('Error fetching MySQL stats:', error);
      return this.getDefaultStats();
    } finally {
      if (db) {
        try {
          db.release();
        } catch (closeError) {
          console.log('Connection already closed or error releasing connection');
        }
      }
    }
  }

  private async getStatsSupabase(): Promise<DatabaseStats> {
    try {
      const { data: applications, error: appsError } = await supabaseAdmin
        .from('applications')
        .select('*', { count: 'exact', head: true });

      if (appsError) throw appsError;
      const totalApplications = applications?.length || 0;

      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;

      const { data: monthlyApplications, error: monthlyAppsError } = await supabaseAdmin
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
        .lt('created_at', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`);

      if (monthlyAppsError) throw monthlyAppsError;

      const { data: orders, error: ordersError } = await supabaseAdmin
        .from('orders')
        .select('total_amount, payment_status');

      let orderStats = { total_orders: 0, paid_orders: 0, total_revenue: 0 };
      let monthlyOrderStats = { total_orders: 0, paid_orders: 0, revenue: 0 };

      if (!ordersError && orders) {
        orderStats.total_orders = orders.length;
        orderStats.paid_orders = orders.filter((o: any) => o.payment_status === 'paid').length;
        orderStats.total_revenue = orders
          .filter((o: any) => o.payment_status === 'paid')
          .reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0);

        const { data: monthlyOrders, error: monthlyOrdersError } = await supabaseAdmin
          .from('orders')
          .select('total_amount, payment_status')
          .gte('created_at', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
          .lt('created_at', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`);

        if (!monthlyOrdersError && monthlyOrders) {
          monthlyOrderStats.total_orders = monthlyOrders.length;
          monthlyOrderStats.paid_orders = monthlyOrders.filter((o: any) => o.payment_status === 'paid').length;
          monthlyOrderStats.revenue = monthlyOrders
            .filter((o: any) => o.payment_status === 'paid')
            .reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0);
        }
      }

      const { data: jurisdictions, error: jurisdictionsError } = await supabaseAdmin
        .from('jurisdictions')
        .select('*', { count: 'exact', head: true });

      if (jurisdictionsError) throw jurisdictionsError;
      const totalJurisdictions = jurisdictions?.length || 0;

      return {
        totalApplications,
        monthlyApplications: monthlyApplications?.length || 0,
        totalOrders: orderStats.total_orders,
        paidOrders: orderStats.paid_orders,
        totalRevenue: orderStats.total_revenue,
        monthlyOrders: monthlyOrderStats.total_orders,
        monthlyRevenue: monthlyOrderStats.revenue,
        totalJurisdictions,
      };
    } catch (error) {
      console.error('Error fetching Supabase stats:', error);
      return this.getDefaultStats();
    }
  }

  private async getOrdersMySQL(
    page: number,
    limit: number,
    search?: string,
    status?: string
  ): Promise<DatabaseOrdersResponse> {
    let db;
    try {
      db = await getConnection();
      const offset = (page - 1) * limit;

      let whereClause = '';
      let queryParams: any[] = [];

      if (search) {
        whereClause = 'WHERE (customer_email LIKE ? OR customer_name LIKE ? OR order_id LIKE ?)';
        queryParams = [`%${search}%`, `%${search}%`, `%${search}%`];
      }

      if (status) {
        if (whereClause) {
          whereClause += ' AND payment_status = ?';
        } else {
          whereClause = 'WHERE payment_status = ?';
        }
        queryParams.push(status);
      }

      const [totalResult]: any = await db.execute(
        `SELECT COUNT(*) as total FROM orders ${whereClause}`,
        queryParams
      );
      const total = totalResult[0]?.total || 0;

      const [ordersResult]: any = await db.execute(
        `SELECT * FROM orders ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [...queryParams, limit, offset]
      );

      return {
        orders: ordersResult || [],
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('Error fetching MySQL orders:', error);
      return {
        orders: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    } finally {
      if (db) {
        try {
          db.release();
        } catch (closeError) {
          console.log('Connection already closed or error releasing connection');
        }
      }
    }
  }

  private async getOrdersSupabase(
    page: number,
    limit: number,
    search?: string,
    status?: string
  ): Promise<DatabaseOrdersResponse> {
    try {
      let query = supabaseAdmin.from('orders').select('*');

      if (search) {
        query = query.or(`customer_email.ilike.%${search}%,customer_name.ilike.%${search}%,order_id.ilike.%${search}%`);
      }

      if (status) {
        query = query.eq('payment_status', status);
      }

      const { data: totalData, error: totalError, count } = await supabaseAdmin
        .from('orders')
        .select('*', { count: 'exact', head: true });

      if (totalError) throw totalError;

      const { data: orders, error: ordersError } = await query
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (ordersError) throw ordersError;

      return {
        orders: orders || [],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      };
    } catch (error) {
      console.error('Error fetching Supabase orders:', error);
      return {
        orders: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }
  }

  private async createOrderMySQL(orderData: any): Promise<DatabaseOrder> {
    const db = await getConnection();

    const [result]: any = await db.execute(
      `INSERT INTO orders (
        order_id, stripe_payment_intent_id, customer_email, customer_name, customer_phone,
        total_amount, currency, payment_status, payment_method, applications_count,
        services_count, order_items, stripe_metadata, paid_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderData.order_id,
        orderData.stripe_payment_intent_id,
        orderData.customer_email,
        orderData.customer_name,
        orderData.customer_phone,
        orderData.total_amount,
        orderData.currency,
        orderData.payment_status,
        orderData.payment_method,
        orderData.applications_count,
        orderData.services_count,
        JSON.stringify(orderData.order_items),
        JSON.stringify(orderData.stripe_metadata),
        orderData.paid_at
      ]
    );

    const [createdOrder]: any = await db.execute(
      'SELECT * FROM orders WHERE id = ?',
      [result.insertId]
    );

    await db.end();
    return createdOrder[0];
  }

  private async createOrderSupabase(orderData: any): Promise<DatabaseOrder> {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  private async updateOrderMySQL(orderId: string, updates: any): Promise<DatabaseOrder> {
    const db = await getConnection();

    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);

    await db.execute(
      `UPDATE orders SET ${setClause} WHERE order_id = ?`,
      [...values, orderId]
    );

    const [updatedOrder]: any = await db.execute(
      'SELECT * FROM orders WHERE order_id = ?',
      [orderId]
    );

    await db.end();
    return updatedOrder[0];
  }

  private async updateOrderSupabase(orderId: string, updates: any): Promise<DatabaseOrder> {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .update(updates)
      .eq('order_id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  private async getOrderStatisticsMySQL(): Promise<{
    statistics: any;
    recentOrders: any[];
    monthlyRevenue: any[];
  }> {
    try {
      const db = await getConnection();

      const [stats]: any = await db.execute(`
        SELECT
          COUNT(*) as total_orders,
          COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as paid_orders,
          COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as pending_orders,
          COUNT(CASE WHEN payment_status = 'failed' THEN 1 END) as failed_orders,
          COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END), 0) as total_revenue,
          COALESCE(AVG(CASE WHEN payment_status = 'paid' THEN total_amount ELSE NULL END), 0) as average_order_value
        FROM orders
      `);

      const [recentOrders]: any = await db.execute(`
        SELECT
          order_id,
          customer_email,
          total_amount,
          currency,
          payment_status,
          applications_count,
          services_count,
          created_at,
          paid_at
        FROM orders
        ORDER BY created_at DESC
        LIMIT 10
      `);

      const [monthlyRevenue]: any = await db.execute(`
        SELECT
          DATE_FORMAT(created_at, '%Y-%m') as month,
          COUNT(*) as orders_count,
          COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END), 0) as revenue
        FROM orders
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month DESC
      `);

      await db.end();

      return {
        statistics: stats[0],
        recentOrders,
        monthlyRevenue,
      };
    } catch (error) {
      console.error('Error fetching MySQL order statistics:', error);
      return {
        statistics: { total_orders: 0, paid_orders: 0, pending_orders: 0, failed_orders: 0, total_revenue: 0, average_order_value: 0 },
        recentOrders: [],
        monthlyRevenue: [],
      };
    }
  }

  private async getOrderStatisticsSupabase(): Promise<{
    statistics: any;
    recentOrders: any[];
    monthlyRevenue: any[];
  }> {
    try {
      const { data: orders, error: ordersError } = await supabaseAdmin
        .from('orders')
        .select('total_amount, payment_status, created_at');

      if (ordersError) throw ordersError;

      const statistics = {
        total_orders: orders?.length || 0,
        paid_orders: orders?.filter((o: any) => o.payment_status === 'paid').length || 0,
        pending_orders: orders?.filter((o: any) => o.payment_status === 'pending').length || 0,
        failed_orders: orders?.filter((o: any) => o.payment_status === 'failed').length || 0,
        total_revenue: orders?.filter((o: any) => o.payment_status === 'paid').reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0) || 0,
        average_order_value: 0,
      };

      const paidOrders = orders?.filter((o: any) => o.payment_status === 'paid') || [];
      if (paidOrders.length > 0) {
        statistics.average_order_value = statistics.total_revenue / paidOrders.length;
      }

      const { data: recentOrders, error: recentError } = await supabaseAdmin
        .from('orders')
        .select('order_id, customer_email, total_amount, currency, payment_status, applications_count, services_count, created_at, paid_at')
        .order('created_at', { ascending: false })
        .limit(10);

      if (recentError) throw recentError;

      const currentDate = new Date();
      const twelveMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 12, 1);

      const { data: monthlyData, error: monthlyError } = await supabaseAdmin
        .from('orders')
        .select('total_amount, payment_status, created_at')
        .gte('created_at', twelveMonthsAgo.toISOString());

      if (monthlyError) throw monthlyError;

      const monthlyRevenue = [];
      const monthlyGroups: { [key: string]: { orders_count: number; revenue: number } } = {};

      monthlyData?.forEach((order: any) => {
        const month = new Date(order.created_at).toISOString().substring(0, 7);
        if (!monthlyGroups[month]) {
          monthlyGroups[month] = { orders_count: 0, revenue: 0 };
        }
        monthlyGroups[month].orders_count++;
        if (order.payment_status === 'paid') {
          monthlyGroups[month].revenue += order.total_amount || 0;
        }
      });

      for (const [month, data] of Object.entries(monthlyGroups)) {
        monthlyRevenue.push({ month, ...data });
      }

      monthlyRevenue.sort((a, b) => b.month.localeCompare(a.month));

      return {
        statistics,
        recentOrders: recentOrders || [],
        monthlyRevenue,
      };
    } catch (error) {
      console.error('Error fetching Supabase order statistics:', error);
      return {
        statistics: { total_orders: 0, paid_orders: 0, pending_orders: 0, failed_orders: 0, total_revenue: 0, average_order_value: 0 },
        recentOrders: [],
        monthlyRevenue: [],
      };
    }
  }

  private async createOrderWithItemsMySQL(orderData: any, applications: any[] = [], services: any[] = []): Promise<DatabaseOrder> {
    const db = await getConnection();

    try {
      // Create the main order record with ON DUPLICATE KEY UPDATE
      await db.execute(
        `INSERT INTO orders (
          order_id,
          stripe_payment_intent_id,
          customer_email,
          customer_name,
          total_amount,
          currency,
          payment_status,
          applications_count,
          services_count,
          order_items,
          stripe_metadata,
          paid_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          payment_status = VALUES(payment_status),
          paid_at = VALUES(paid_at),
          updated_at = NOW()`,
        [
          orderData.order_id,
          orderData.stripe_payment_intent_id,
          orderData.customer_email,
          orderData.customer_name || null,
          orderData.total_amount,
          orderData.currency || 'GBP',
          orderData.payment_status,
          applications.length,
          services.length,
          JSON.stringify({ applications, standalone_services: services }),
          JSON.stringify(orderData.stripe_metadata || {}),
          orderData.paid_at || null
        ]
      );

      // Insert individual order items for applications
      for (const app of applications) {
        // Handle both old format (app.jurisdiction is string) and new format (app.jurisdiction is object)
        const jurisdictionName = typeof (app as any).jurisdiction === 'string'
          ? (app as any).jurisdiction
          : ((app as any).jurisdiction?.name || 'Unknown');

        const price = (app as any).price || (app as any).jurisdiction?.price || 0;
        const currency = (app as any).currency || (app as any).jurisdiction?.currency || 'GBP';

        await db.execute(
          `INSERT INTO order_items (
            order_id,
            item_type,
            item_name,
            jurisdiction_name,
            unit_price,
            quantity,
            total_price,
            currency,
            item_metadata
          ) VALUES (?, 'application', ?, ?, ?, 1, ?, ?, ?)`,
          [
            orderData.order_id,
            `${jurisdictionName} Company Formation`,
            jurisdictionName,
            price,
            price,
            currency,
            JSON.stringify(app)
          ]
        );
      }

      // Insert individual order items for services
      for (const service of services) {
        await db.execute(
          `INSERT INTO order_items (
            order_id,
            item_type,
            item_name,
            unit_price,
            quantity,
            total_price,
            currency,
            item_metadata
          ) VALUES (?, 'service', ?, ?, 1, ?, ?, ?)`,
          [
            orderData.order_id,
            service.name,
            service.price,
            service.price,
            service.currency || 'GBP',
            JSON.stringify(service)
          ]
        );
      }

      // Get the created order
      const [createdOrder]: any = await db.execute(
        'SELECT * FROM orders WHERE order_id = ?',
        [orderData.order_id]
      );

      return createdOrder[0];
    } finally {
      await db.end();
    }
  }

  private async createOrderWithItemsSupabase(orderData: any, applications: any[] = [], services: any[] = []): Promise<DatabaseOrder> {
    // Create the main order record with upsert
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .upsert({
        ...orderData,
        applications_count: applications.length,
        services_count: services.length,
        order_items: { applications, standalone_services: services },
        stripe_metadata: orderData.stripe_metadata || {},
      }, {
        onConflict: 'order_id'
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Insert individual order items for applications
    const applicationItems = applications.map((app: any) => {
      // Handle both old format (app.jurisdiction is string) and new format (app.jurisdiction is object)
      const jurisdictionName = typeof app.jurisdiction === 'string'
        ? app.jurisdiction
        : (app.jurisdiction?.name || 'Unknown');

      const price = app.price || app.jurisdiction?.price || 0;
      const currency = app.currency || app.jurisdiction?.currency || 'GBP';

      return {
        order_id: orderData.order_id,
        item_type: 'application' as const,
        item_name: `${jurisdictionName} Company Formation`,
        jurisdiction_name: jurisdictionName,
        unit_price: price,
        quantity: 1,
        total_price: price,
        currency: currency,
        item_metadata: app
      };
    });

    // Insert individual order items for services
    const serviceItems = services.map(service => ({
      order_id: orderData.order_id,
      item_type: 'service' as const,
      item_name: service.name,
      jurisdiction_name: null,
      unit_price: service.price,
      quantity: 1,
      total_price: service.price,
      currency: service.currency || 'GBP',
      item_metadata: service
    }));

    // Insert all order items
    const allItems = [...applicationItems, ...serviceItems];
    if (allItems.length > 0) {
      // First, try to delete existing items for this order (in case of retry)
      await supabaseAdmin
        .from('order_items')
        .delete()
        .eq('order_id', orderData.order_id);

      // Then insert new items
      const { error: itemsError } = await supabaseAdmin
        .from('order_items')
        .insert(allItems);

      if (itemsError) {
        console.error('Error inserting order items:', itemsError);
        throw itemsError;
      }
    }

    return order;
  }

  private getDefaultStats(): DatabaseStats {
    return {
      totalApplications: 0,
      monthlyApplications: 0,
      totalOrders: 0,
      paidOrders: 0,
      totalRevenue: 0,
      monthlyOrders: 0,
      monthlyRevenue: 0,
      totalJurisdictions: 0,
    };
  }
}

export const db = new DatabaseService();