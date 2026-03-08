export interface Site {
  id: number;
  code: string;
  name: string;
  address: string | null;
  city: string | null;
  country: string;
  longitude: number | null;
  latitude: number | null;
  status: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  zones?: Zone[];
}

export interface Zone {
  id: number;
  code: string;
  name: string;
  floor: string | null;
  building: string | null;
  site_id: number;
  status: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  site?: Site;
  batiments?: Batiment[];
  coffrets?: Coffret[];
}

export interface Coffret {
  id: number;
  code: string;
  name: string;
  piece: string;
  type: string | null;
  long: number | null;
  lat: number | null;
  status: string;
  photo: string | null;
  qr_token: string;
  zone_id: number | null;
  salle_id: number | null;
  created_at: string;
  updated_at: string;
  zone?: Zone;
  salle?: Salle;
  equipments?: Equipement[];
  metrics?: Metric[];
}

export interface Equipement {
  id: number;
  equipement_code: string;
  name: string;
  type: string;
  classification: string;
  serial_number: string | null;
  fabricant: string | null;
  modele: string | null;
  connection_type: string | null;
  description: string | null;
  direction_in_out: string | null;
  vlan: string | null;
  ip_address: string | null;
  coffret_id: number;
  status: string;
  qr_token: string;
  created_at: string;
  updated_at: string;
  coffret?: Coffret;
  ports?: Port[];
}

export interface Port {
  id: number;
  port_label: string;
  device_name: string;
  poe_enabled: boolean;
  vlan: string | null;
  speed: string | null;
  connected_equipment_id: number | null;
  equipement_id: number | null;
  status: string;
  port_type: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  equipement?: Equipement;
  connected_equipment?: Equipement;
}

export interface Metric {
  id: number;
  name: string;
  type: string;
  description: string | null;
  last_value: string | null;
  coffret_id: number;
  status: boolean;
  created_at: string;
  updated_at: string;
  coffret?: Coffret;
}

export interface Liaison {
  id: number;
  from: number;
  to: number;
  label: string;
  media: string;
  length: number | null;
  status: boolean;
  from_port_id: number | null;
  to_port_id: number | null;
  status_label: string;
  created_at: string;
  updated_at: string;
  from_equipement?: Equipement;
  to_equipement?: Equipement;
  from_port?: Port;
  to_port?: Port;
}

export interface SystemModel {
  id: number;
  name: string;
  type: string;
  description: string | null;
  vendor: string | null;
  endpoint: string | null;
  monitored_scope: string | null;
  status: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  name: string;
  surname: string;
  username: string;
  phone: string | null;
  role: string;
  email: string;
  is_active: boolean;
  site_id: number | null;
  two_factor_enabled: boolean;
  created_at: string;
  updated_at: string;
  site?: Site;
}

export interface Batiment {
  id: number;
  code: string;
  name: string;
  zone_id: number;
  address: string | null;
  floors_count: number | null;
  longitude: number | null;
  latitude: number | null;
  status: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  zone?: Zone;
  salles?: Salle[];
}

export interface Salle {
  id: number;
  code: string;
  name: string;
  batiment_id: number;
  floor: string | null;
  type: string | null;
  status: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  batiment?: Batiment;
  coffrets?: Coffret[];
}

export interface Vlan {
  id: number;
  vlan_id: number;
  name: string;
  description: string | null;
  site_id: number | null;
  network: string | null;
  gateway: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  site?: Site;
}

export interface Maintenance {
  id: number;
  code: string;
  title: string;
  description: string | null;
  type: string;
  priority: string;
  status: string;
  equipement_id: number | null;
  coffret_id: number | null;
  site_id: number | null;
  technicien_id: number;
  validator_id: number | null;
  scheduled_date: string;
  scheduled_time: string | null;
  started_at: string | null;
  completed_at: string | null;
  duration_minutes: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  technicien?: User;
  validator?: User;
  equipement?: Equipement;
  coffret?: Coffret;
  site?: Site;
}

export interface ChangeRequest {
  id: number;
  code: string;
  coffret_id: number;
  requester_id: number;
  type: string;
  description: string;
  justification: string;
  photo_before: string | null;
  photo_after: string | null;
  intervention_date: string;
  status: string;
  reviewer_id: number | null;
  reviewed_at: string | null;
  review_comment: string | null;
  snapshot_before: Record<string, any>;
  snapshot_after: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  coffret?: Coffret;
  requester?: User;
  reviewer?: User;
}

export interface AppNotification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  data: Record<string, any> | null;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationsResponse {
  notifications: PaginatedData<AppNotification>;
  unread_count: number;
}

export interface ActivityLog {
  id: number;
  user_id: number;
  action: string;
  entity_type: string;
  entity_id: number;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  ip_address: string | null;
  created_at: string;
  user?: User;
}

export interface LoginAudit {
  id: number;
  user_id: number;
  action: string;
  ip_address: string | null;
  user_agent: string | null;
  method: string | null;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface ApiResponse<T> {
  status: number;
  data: T;
  message: string;
}

export interface PaginatedData<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

export interface ListParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  [key: string]: string | number | undefined;
}
