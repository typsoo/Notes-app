CREATE TABLE "final-notes-app_account" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"issuer" text NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"access_token_expires_at" timestamp(6) with time zone,
	"refresh_token_expires_at" timestamp(6) with time zone,
	"scope" text,
	"id_token" text,
	"password" text,
	"created_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp(6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "final-notes-app_document_links" (
	"sourceId" uuid,
	"targetId" uuid,
	CONSTRAINT "final-notes-app_document_links_pkey" PRIMARY KEY("sourceId","targetId")
);
--> statement-breakpoint
CREATE TABLE "final-notes-app_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"workspaceId" uuid NOT NULL,
	"title" varchar(256) NOT NULL,
	"content" text NOT NULL,
	"isPinned" boolean DEFAULT false NOT NULL,
	"isArchived" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "final-notes-app_session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"token" varchar(255) NOT NULL UNIQUE,
	"expires_at" timestamp(6) with time zone NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp(6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "final-notes-app_user_workspaces" (
	"userId" uuid,
	"workspaceId" uuid,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "final-notes-app_user_workspaces_pkey" PRIMARY KEY("userId","workspaceId")
);
--> statement-breakpoint
CREATE TABLE "final-notes-app_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"email" varchar(255) NOT NULL UNIQUE,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp(6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "final-notes-app_verification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp(6) with time zone NOT NULL,
	"created_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp(6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "final-notes-app_workspaces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(256) NOT NULL
);
--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "final-notes-app_account" ("user_id");--> statement-breakpoint
CREATE INDEX "document_links_targetId_idx" ON "final-notes-app_document_links" ("targetId");--> statement-breakpoint
CREATE INDEX "documents_workspaceId_idx" ON "final-notes-app_documents" ("workspaceId");--> statement-breakpoint
CREATE UNIQUE INDEX "documents_workspaceId_title_idx" ON "final-notes-app_documents" ("workspaceId","title");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "final-notes-app_session" ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "final-notes-app_verification" ("identifier");--> statement-breakpoint
ALTER TABLE "final-notes-app_account" ADD CONSTRAINT "final-notes-app_account_user_id_final-notes-app_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "final-notes-app_users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "final-notes-app_document_links" ADD CONSTRAINT "final-notes-app_document_links_2axJTWUbzgGR_fkey" FOREIGN KEY ("sourceId") REFERENCES "final-notes-app_documents"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "final-notes-app_document_links" ADD CONSTRAINT "final-notes-app_document_links_t82y5dDnMgVh_fkey" FOREIGN KEY ("targetId") REFERENCES "final-notes-app_documents"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "final-notes-app_documents" ADD CONSTRAINT "final-notes-app_documents_rBd5ztMMkEnc_fkey" FOREIGN KEY ("workspaceId") REFERENCES "final-notes-app_workspaces"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "final-notes-app_session" ADD CONSTRAINT "final-notes-app_session_user_id_final-notes-app_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "final-notes-app_users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "final-notes-app_user_workspaces" ADD CONSTRAINT "final-notes-app_user_workspaces_nySCQUcmPm8Q_fkey" FOREIGN KEY ("userId") REFERENCES "final-notes-app_users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "final-notes-app_user_workspaces" ADD CONSTRAINT "final-notes-app_user_workspaces_ZyHnraSgcTMw_fkey" FOREIGN KEY ("workspaceId") REFERENCES "final-notes-app_workspaces"("id") ON DELETE CASCADE;