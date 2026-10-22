import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AdminUser, LoginRequest, LoginResponse } from '../models/admin-user.model';
import { ContactPayload, ContactRequest, ContactStatus } from '../models/contact-request.model';
import { Project, ProjectInput } from '../models/project.model';
import { Service, ServiceInput } from '../models/service.model';

/**
 * Every call the frontend makes to the Spring Boot backend lives here.
 * Paths are relative (`/api/...`): in development `proxy.conf.json` forwards them to
 * http://localhost:8080, in production serve both behind the same origin (same-origin cookies + CSRF).
 */
@Injectable({ providedIn: 'root' })
export class Api {
  private readonly http = inject(HttpClient);
  private readonly base = '/api';

  // ---------- public ----------
  getServices(): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.base}/services`);
  }

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.base}/projects`);
  }

  sendContact(payload: ContactPayload & { website?: string }): Observable<unknown> {
    return this.http.post(`${this.base}/contact`, payload);
  }

  // ---------- admin auth ----------
  login(body: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.base}/admin/login`, body);
  }

  logout(): Observable<unknown> {
    return this.http.post(`${this.base}/admin/logout`, {});
  }

  me(): Observable<AdminUser> {
    return this.http.get<AdminUser>(`${this.base}/admin/me`);
  }

  // ---------- admin: services ----------
  adminServices(): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.base}/admin/services`);
  }
  createService(s: ServiceInput): Observable<Service> {
    return this.http.post<Service>(`${this.base}/admin/services`, s);
  }
  updateService(id: number, s: ServiceInput): Observable<Service> {
    return this.http.put<Service>(`${this.base}/admin/services/${id}`, s);
  }
  deleteService(id: number): Observable<unknown> {
    return this.http.delete(`${this.base}/admin/services/${id}`);
  }

  // ---------- admin: projects ----------
  adminProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.base}/admin/projects`);
  }
  createProject(p: ProjectInput): Observable<Project> {
    return this.http.post<Project>(`${this.base}/admin/projects`, p);
  }
  updateProject(id: number, p: ProjectInput): Observable<Project> {
    return this.http.put<Project>(`${this.base}/admin/projects/${id}`, p);
  }
  deleteProject(id: number): Observable<unknown> {
    return this.http.delete(`${this.base}/admin/projects/${id}`);
  }

  // ---------- admin: contact requests ----------
  adminContacts(): Observable<ContactRequest[]> {
    return this.http.get<ContactRequest[]>(`${this.base}/admin/contacts`);
  }
  setContactStatus(id: number, status: ContactStatus): Observable<ContactRequest> {
    return this.http.patch<ContactRequest>(`${this.base}/admin/contacts/${id}`, { status });
  }
  deleteContact(id: number): Observable<unknown> {
    return this.http.delete(`${this.base}/admin/contacts/${id}`);
  }
}
