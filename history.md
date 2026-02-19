# 2026-02-20
## 1차 배포
- S3 버킷 생성
- CloudFront 배포
- GitHub Actions 설정
- CI/CD 파이프라인 

# 2026-02-20
## 2차 배포
- with: role-to-assume: 수정

# 2026-02-20
## 3차 배포
- with: role-to-assume: 수정
- ID 제공업체 -> 역할에 있는 pharminsight-github로 수정

# 2026-02-20
## 4차 배포
- GPT가 신뢰관계 정책에서 언더바를 하이픈으로 줌gpt

# github-deploy-s3 권한 수정

## 기존
{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Sid": "S3DeployArtifact",
			"Effect": "Allow",
			"Action": [
				"s3:PutObject",
				"s3:GetObject"
			],
			"Resource": "arn:aws:s3:::pharminsight-deploy-bucket/*"
		},
		{
			"Sid": "SSMSendCommand",
			"Effect": "Allow",
			"Action": [
				"ssm:SendCommand"
			],
			"Resource": "*"
		}
	]
}

## 수정
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3DeployArtifact",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::pharminsight-deploy-bucket/*"
    },

    {
      "Sid": "S3ListBucketForSync",
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::pharminsight.kr"
    },
    {
      "Sid": "S3ObjectRWForDeploy",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::pharminsight.kr/*"
    },

    {
      "Sid": "CloudFrontInvalidate",
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation"
      ],
      "Resource": "*"
    },

    {
      "Sid": "SSMSendCommand",
      "Effect": "Allow",
      "Action": [
        "ssm:SendCommand"
      ],
      "Resource": "*"
    }
  ]
}

# 2026-02-20
## 5차 배포
- 클라우드 프론트 기본 루트 객체(Default Root Object) index.html 설정
