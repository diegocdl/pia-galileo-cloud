resource "aws_dynamodb_table" "image_analysis" {
  name         = "image-analysis-results"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "image_name"

  attribute {
    name = "image_name"
    type = "S"
  }

  tags = {
    Name        = "Image Analysis Results"
    Environment = "Dev"
  }
}
