import {SignJWT,jwtVerify} from 'jose';import {cookies} from 'next/headers';
const key=()=>new TextEncoder().encode(process.env.JWT_SECRET||'development-secret-change-me-32bytes');
export async function issueAdminToken(admin:{id:string;email:string;role:string}){return new SignJWT({email:admin.email,role:admin.role}).setProtectedHeader({alg:'HS256'}).setSubject(admin.id).setIssuedAt().setExpirationTime('8h').sign(key())}
export async function requireAdmin(){const token=(await cookies()).get('admin_session')?.value;if(!token)throw new Error('UNAUTHORIZED');const {payload}=await jwtVerify(token,key());return {id:String(payload.sub),role:String(payload.role)};}
