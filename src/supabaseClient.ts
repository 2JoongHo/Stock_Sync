// src/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

// .env 파일에 넣은 열쇠들을 가져오기
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 슈파베이스와 대화할 클라이언트를 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
