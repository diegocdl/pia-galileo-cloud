terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.88.0"
    }
  }
}

provider "aws" {
  # Configuration options
}

# S3 bucket resource
resource "aws_s3_bucket" "demo_bucket" {
  bucket = "imagenes-a-procesar-pia"

  tags = {
    Name        = "Demo PIA Bucket"
    Environment = "Dev"
  }
}

# Optional: Configure bucket versioning
resource "aws_s3_bucket_versioning" "versioning" {
  bucket = aws_s3_bucket.demo_bucket.id
  versioning_configuration {
    status = "Enabled"
  }
}

# Optional: Configure server-side encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "encryption" {
  bucket = aws_s3_bucket.demo_bucket.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}
