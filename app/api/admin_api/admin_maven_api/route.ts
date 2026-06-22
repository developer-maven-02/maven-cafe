// app/api/admin/operation-report/route.js
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import crypto from "crypto";
import { z } from "zod";

// ===============================
// TYPES
// ===============================

interface Filters {
  status: string | null;
  startDate: string | null;
  endDate: string | null;
}

interface SingleTableResult {
  table: string;
  count: number;
  data?: any[];
  filters: Filters;
  error?: string;
}

interface MultipleTableResult {
  [key: string]: SingleTableResult;
}

interface KPIResponse {
  users: {
    total: number;
    active: number;
  };
  menu: {
    total: number;
    available: number;
  };
  orders: {
    completed: number;
    rejected: number;
  };
}

interface FetchOptions {
  status?: string;
  startDate?: string;
  endDate?: string;
  isCountOnly: boolean;
  includeData: boolean;
}

// ===============================
// SCHEMA VALIDATION
// ===============================

const QuerySchema = z.object({
  table: z.enum(["users", "items", "orders"]).optional(),
  tables: z.string().optional(),
  status: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  kpiFlag: z.enum(["true", "false"]).optional().default("true"),
  dataFlag: z.enum(["true", "false"]).optional().default("false"),
}).strict();

// ===============================
// CORS HEADERS
// ===============================

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-api-key, x-signature, x-timestamp",
  "Access-Control-Allow-Credentials": "true",
};

// ===============================
// AUTH FUNCTIONS
// ===============================

function generateSignature(timestamp: string): string {
  const secret = process.env.THIRD_PARTY_SECRET_KEY;
  if (!secret) {
    throw new Error("THIRD_PARTY_SECRET_KEY is missing");
  }
  return crypto.createHmac("sha256", secret).update(timestamp).digest("hex");
}

function safeCompare(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufferA, bufferB);
}

// ===============================
// OPTIONS HANDLER
// ===============================

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// ===============================
// MAIN GET HANDLER
// ===============================

export async function GET(req: Request) {
  try {
    // ===============================
    // AUTH VALIDATION
    // ===============================

    const apiKey = req.headers.get("x-api-key");
    const timestamp = req.headers.get("x-timestamp");
    const signature = req.headers.get("x-signature");

    console.log("🔑 Auth Headers:", { apiKey, timestamp, signature });

    if (!apiKey || !timestamp || !signature) {
      return NextResponse.json(
        { success: false, message: "Missing authentication headers" },
        { status: 401, headers: corsHeaders }
      );
    }

    if (apiKey !== process.env.THIRD_PARTY_SECRET_KEY) {
      return NextResponse.json(
        { success: false, message: "Invalid API key" },
        { status: 401, headers: corsHeaders }
      );
    }

    const requestTime = Number(timestamp);
    if (Number.isNaN(requestTime) || Math.abs(Date.now() - requestTime) > 5 * 60 * 1000) {
      return NextResponse.json(
        { success: false, message: "Request expired" },
        { status: 401, headers: corsHeaders }
      );
    }

    const expectedSignature = generateSignature(timestamp);
    if (!safeCompare(signature, expectedSignature)) {
      return NextResponse.json(
        { success: false, message: "Invalid signature" },
        { status: 401, headers: corsHeaders }
      );
    }

    // ===============================
    // QUERY PARAM VALIDATION
    // ===============================

    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams.entries());

    console.log("📊 Query Params:", params);

    const validation = QuerySchema.safeParse(params);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: "Invalid parameters", errors: validation.error.flatten() },
        { status: 400, headers: corsHeaders }
      );
    }

    const { table, tables, status, startDate, endDate, kpiFlag, dataFlag } = validation.data;
    const isCountOnly = kpiFlag === "true";
    const includeData = dataFlag === "true";

    console.log(`📊 Flags: kpiFlag=${kpiFlag}, dataFlag=${dataFlag}, tables=${tables}, status=${status}`);

    // ===============================
    // HANDLE KPI RESPONSE (when kpiFlag=true)
    // ===============================
    
    if (kpiFlag === "true") {
      console.log("📊 Generating KPI response (ignoring status filter for KPI)");
      
      // Fetch KPI data for all three tables - IGNORE status for KPI
      const [usersData, menuData, ordersData] = await Promise.all([
        fetchKPIData("users", { startDate, endDate }), // No status passed
        fetchKPIData("items", { startDate, endDate }), // No status passed
        fetchKPIData("orders", { startDate, endDate }) // No status passed
      ]);

      // Format KPI response
      const kpiResponse: KPIResponse = {
        users: {
          total: usersData.total || 0,
          active: usersData.active || 0
        },
        menu: {
          total: menuData.total || 0,
          available: menuData.available || 0
        },
        orders: {
          completed: ordersData.completed || 0,
          rejected: ordersData.rejected || 0
        }
      };

      console.log("✅ KPI Response:", kpiResponse);

      // If dataFlag is also true, fetch detailed data too (WITH status filter)
      if (dataFlag === "true") {
        console.log("📊 Also fetching detailed data because dataFlag=true (with status filter)");
        
        let detailedData = null;
        
        // Determine which tables to fetch details for
        let tableNames: string[] = [];
        if (tables) {
          tableNames = tables.split(',').map(t => t.trim()).filter(
            (t): t is "users" | "items" | "orders" => ['users', 'items', 'orders'].includes(t)
          );
        } else {
          // If no tables specified, default to all three
          tableNames = ['users', 'items', 'orders'];
        }

        if (tableNames.length > 0) {
          detailedData = await fetchMultipleTables(tableNames, { 
            status, // Pass status for detailed data
            startDate, 
            endDate, 
            isCountOnly: false,
            includeData: true
          });
        }

        return NextResponse.json(
          {
            success: true,
            data: {
              kpi: kpiResponse,
              details: detailedData
            },
            kpiFlag,
            dataFlag,
            timestamp: new Date().toISOString()
          },
          { headers: corsHeaders }
        );
      }

      // Only KPI data (dataFlag is false)
      return NextResponse.json(
        {
          success: true,
          data: kpiResponse,
          kpiFlag,
          dataFlag,
          timestamp: new Date().toISOString()
        },
        { headers: corsHeaders }
      );
    }

    // ===============================
    // HANDLE DATA ONLY (kpiFlag=false, dataFlag=true)
    // ===============================

    if (dataFlag === "true" && kpiFlag === "false") {
      console.log("📊 Generating Data only response (with status filter)");
      
      // Determine which tables to fetch
      let tableNames: string[] = [];
      if (tables) {
        tableNames = tables.split(',').map(t => t.trim()).filter(
          (t): t is "users" | "items" | "orders" => ['users', 'items', 'orders'].includes(t)
        );
      } else if (table) {
        tableNames = [table as "users" | "items" | "orders"];
      } else {
        // Default to all three
        tableNames = ['users', 'items', 'orders'];
      }
      
      if (tableNames.length === 0) {
        return NextResponse.json(
          { success: false, message: "No valid tables specified. Allowed: users, items, orders" },
          { status: 400, headers: corsHeaders }
        );
      }

      const results = await fetchMultipleTables(tableNames, { 
        status, // Pass status for detailed data
        startDate, 
        endDate, 
        isCountOnly: false,
        includeData: true
      });

      return NextResponse.json(
        {
          success: true,
          data: results,
          kpiFlag,
          dataFlag,
          timestamp: new Date().toISOString()
        },
        { headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        message: "Invalid request. Use kpiFlag=true for KPI data or dataFlag=true for detailed data." 
      },
      { status: 400, headers: corsHeaders }
    );

  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : "Internal Server Error" 
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

// ===============================
// KPI DATA FETCHING FUNCTIONS (IGNORES STATUS)
// ===============================

async function fetchKPIData(
  table: string, 
  options: { startDate?: string; endDate?: string } // No status parameter
) {
  const { startDate, endDate } = options;
  
  console.log(`📊 Fetching KPI for ${table} (ignoring status)`);

  // Build base query - NO STATUS FILTER
  let query = supabaseServer
    .from(table)
    .select("*", { count: "exact", head: true });

  // Apply date filters if provided
  if (startDate) {
    query = query.gte("created_at", startDate);
  }
  if (endDate) {
    query = query.lte("created_at", endDate);
  }

  // Get total count
  const totalResult = await query;
  const total = totalResult.count || 0;

  // Get active/available/completed counts based on table type
  let activeCount = 0;

  if (table === "users") {
    // For users: count active users - NO STATUS FILTER
    let activeQuery = supabaseServer
      .from(table)
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    if (startDate) activeQuery = activeQuery.gte("created_at", startDate);
    if (endDate) activeQuery = activeQuery.lte("created_at", endDate);

    const activeResult = await activeQuery;
    activeCount = activeResult.count || 0;

    return { total, active: activeCount };

  } else if (table === "items") {
    // For items: count available items - NO STATUS FILTER
    let availableQuery = supabaseServer
      .from(table)
      .select("*", { count: "exact", head: true })
      .eq("is_available", true);

    if (startDate) availableQuery = availableQuery.gte("created_at", startDate);
    if (endDate) availableQuery = availableQuery.lte("created_at", endDate);

    const availableResult = await availableQuery;
    activeCount = availableResult.count || 0;

    return { total, available: activeCount };

  } else if (table === "orders") {
    // For orders: count completed and rejected orders - NO STATUS FILTER
    let completedQuery = supabaseServer
      .from(table)
      .select("*", { count: "exact", head: true })
      .eq("status", "Served");

    if (startDate) completedQuery = completedQuery.gte("created_at", startDate);
    if (endDate) completedQuery = completedQuery.lte("created_at", endDate);

    const completedResult = await completedQuery;

    let rejectedQuery = supabaseServer
      .from(table)
      .select("*", { count: "exact", head: true })
      .eq("status", "Rejected");

    if (startDate) rejectedQuery = rejectedQuery.gte("created_at", startDate);
    if (endDate) rejectedQuery = rejectedQuery.lte("created_at", endDate);

    const rejectedResult = await rejectedQuery;

    return { 
      completed: completedResult.count || 0, 
      rejected: rejectedResult.count || 0 
    };
  }

  return { total: 0 };
}

// ===============================
// DETAILED DATA FETCHING FUNCTIONS (RESPECTS STATUS)
// ===============================

async function fetchSingleTable(
  table: string, 
  options: FetchOptions
): Promise<SingleTableResult> {
  const { status, startDate, endDate, isCountOnly, includeData } = options;
  
  console.log(`🔍 Fetching ${table} details: includeData=${includeData}, status=${status}`);

  // Build count query - WITH STATUS FILTER
  let countQuery = supabaseServer
    .from(table)
    .select("*", { count: "exact", head: true });

  if (status) {
    if (table === "items") {
      countQuery = countQuery.eq("is_available", status === "true");
    } else {
      countQuery = countQuery.eq("status", status);
    }
  }

  if (startDate) {
    countQuery = countQuery.gte("created_at", startDate);
  }

  if (endDate) {
    countQuery = countQuery.lte("created_at", endDate);
  }

  const countResult = await countQuery;

  if (countResult.error) {
    throw countResult.error;
  }

  const filters: Filters = {
    status: status || null,
    startDate: startDate || null,
    endDate: endDate || null
  };

  const response: SingleTableResult = {
    table,
    count: countResult.count || 0,
    filters
  };

  // Fetch detailed data if requested - WITH STATUS FILTER
  if (includeData) {
    console.log(`📊 Fetching detailed data for ${table} with status filter`);
    
    let dataQuery = supabaseServer
      .from(table)
      .select("*");

    if (status) {
      if (table === "items") {
        dataQuery = dataQuery.eq("is_available", status === "true");
      } else {
        dataQuery = dataQuery.eq("status", status);
      }
    }

    if (startDate) {
      dataQuery = dataQuery.gte("created_at", startDate);
    }

    if (endDate) {
      dataQuery = dataQuery.lte("created_at", endDate);
    }

    dataQuery = dataQuery.order("created_at", { ascending: false });

    const dataResult = await dataQuery;
    
    if (!dataResult.error) {
      response.data = dataResult.data || [];
      console.log(`✅ Fetched ${response.data.length} records for ${table}`);
    } else {
      console.error(`❌ Error fetching data for ${table}:`, dataResult.error);
    }
  }

  return response;
}

async function fetchMultipleTables(
  tableNames: string[], 
  options: FetchOptions
): Promise<MultipleTableResult> {
  const results: MultipleTableResult = {};
  
  await Promise.all(
    tableNames.map(async (table) => {
      try {
        const result = await fetchSingleTable(table, options);
        results[table] = result;
      } catch (error) {
        console.error(`Error fetching ${table}:`, error);
        results[table] = {
          table,
          count: 0,
          error: error instanceof Error ? error.message : "Unknown error",
          filters: {
            status: options.status || null,
            startDate: options.startDate || null,
            endDate: options.endDate || null
          }
        };
      }
    })
  );
  
  return results;
}