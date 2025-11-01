const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3")
const fs = require("fs")

const region = process.env.AWS_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY_ID
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
const bucket = process.env.COST_REPORT_BUCKET
const key = process.env.COST_REPORT_KEY

const s3Client = new S3Client({
  region: region || "us-east-1",
  credentials: {
    accessKeyId: accessKeyId || "",
    secretAccessKey: secretAccessKey || "",
  },
})

async function uploadMockData() {
  try {
    const mockData = {
      "ResultsByTime": [
        {
          "TimePeriod": {
            "Start": "2025-10-01",
            "End": "2025-10-02"
          },
          "Total": {
            "BlendedCost": {
              "Amount": "15.50",
              "Unit": "USD"
            }
          },
          "Groups": [
            {
              "Keys": ["EC2-Instance"],
              "Metrics": {
                "BlendedCost": {
                  "Amount": "10.00",
                  "Unit": "USD"
                }
              }
            },
            {
              "Keys": ["Amazon Simple Storage Service"],
              "Metrics": {
                "BlendedCost": {
                  "Amount": "3.50",
                  "Unit": "USD"
                }
              }
            },
            {
              "Keys": ["AWS Lambda"],
              "Metrics": {
                "BlendedCost": {
                  "Amount": "2.00",
                  "Unit": "USD"
                }
              }
            }
          ]
        },
        {
          "TimePeriod": {
            "Start": "2025-10-02",
            "End": "2025-10-03"
          },
          "Total": {
            "BlendedCost": {
              "Amount": "16.20",
              "Unit": "USD"
            }
          },
          "Groups": [
            {
              "Keys": ["EC2-Instance"],
              "Metrics": {
                "BlendedCost": {
                  "Amount": "10.50",
                  "Unit": "USD"
                }
              }
            },
            {
              "Keys": ["Amazon Simple Storage Service"],
              "Metrics": {
                "BlendedCost": {
                  "Amount": "4.00",
                  "Unit": "USD"
                }
              }
            },
            {
              "Keys": ["AWS Lambda"],
              "Metrics": {
                "BlendedCost": {
                  "Amount": "1.70",
                  "Unit": "USD"
                }
              }
            }
          ]
        },
        {
          "TimePeriod": {
            "Start": "2025-10-03",
            "End": "2025-10-04"
          },
          "Total": {
            "BlendedCost": {
              "Amount": "14.80",
              "Unit": "USD"
            }
          },
          "Groups": [
            {
              "Keys": ["EC2-Instance"],
              "Metrics": {
                "BlendedCost": {
                  "Amount": "9.00",
                  "Unit": "USD"
                }
              }
            },
            {
              "Keys": ["Amazon Simple Storage Service"],
              "Metrics": {
                "BlendedCost": {
                  "Amount": "3.80",
                  "Unit": "USD"
                }
              }
            },
            {
              "Keys": ["AWS Lambda"],
              "Metrics": {
                "BlendedCost": {
                  "Amount": "2.00",
                  "Unit": "USD"
                }
              }
            }
          ]
        },
        {
          "TimePeriod": {
            "Start": "2025-10-04",
            "End": "2025-10-05"
          },
          "Total": {
            "BlendedCost": {
              "Amount": "17.30",
              "Unit": "USD"
            }
          },
          "Groups": [
            {
              "Keys": ["EC2-Instance"],
              "Metrics": {
                "BlendedCost": {
                  "Amount": "11.00",
                  "Unit": "USD"
                }
              }
            },
            {
              "Keys": ["Amazon Simple Storage Service"],
              "Metrics": {
                "BlendedCost": {
                  "Amount": "4.50",
                  "Unit": "USD"
                }
              }
            },
            {
              "Keys": ["AWS Lambda"],
              "Metrics": {
                "BlendedCost": {
                  "Amount": "1.80",
                  "Unit": "USD"
                }
              }
            }
          ]
        },
        {
          "TimePeriod": {
            "Start": "2025-10-05",
            "End": "2025-10-06"
          },
          "Total": {
            "BlendedCost": {
              "Amount": "18.00",
              "Unit": "USD"
            }
          },
          "Groups": [
            {
              "Keys": ["EC2-Instance"],
              "Metrics": {
                "BlendedCost": {
                  "Amount": "12.00",
                  "Unit": "USD"
                }
              }
            },
            {
              "Keys": ["Amazon Simple Storage Service"],
              "Metrics": {
                "BlendedCost": {
                  "Amount": "4.00",
                  "Unit": "USD"
                }
              }
            },
            {
              "Keys": ["AWS Lambda"],
              "Metrics": {
                "BlendedCost": {
                  "Amount": "2.00",
                  "Unit": "USD"
                }
              }
            }
          ]
        }
      ]
    }

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: JSON.stringify(mockData, null, 2),
      ContentType: "application/json",
    })

    await s3Client.send(command)
    console.log("Mock data uploaded successfully to S3")
  } catch (error) {
    console.error("Error uploading mock data:", error)
  }
}

uploadMockData()
