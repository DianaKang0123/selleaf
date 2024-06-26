![image](https://github.com/DianaKang0123/selleaf_with_ai/assets/156397873/dd605b73-028a-4499-8f2b-e253d34065bf)<br>
<br>
<br>

![logo-lettering](https://github.com/DianaKang0123/selleaf/assets/156397873/b5f4c8cd-6d88-4965-9336-ad89f151ba52)
<br>
<br>
<br>

# 머신러닝 웹 적용 프로젝트
<br>
<br>
<br>

![image-6](https://github.com/DianaKang0123/selleaf/assets/156397873/7fad2a49-5eea-4445-88d9-9866b8005e92)

<br>

##  유사도 분석을 통한 태그 추천 시스템

### **👍 목차**

1. 개요
2. 데이터 준비
3. 코사인 유사도 계산
4. 추천 알고리즘의 흐름
5. 결과

<br>

---
<br>

### **1️⃣ 개요**

<br>

셀리프의 커뮤니티에는 두 종류의 게시물이 있습니다. 노하우와 포스트 두가지 모두 태그를 사용합니다. 이 **태그**는 게시물을 그룹화하여 사용자가 원하는 게시글을 모아서 볼 수 있도록 도와주는 기능 입니다.

**유사도 분석을 통한 태그 추천 시스템**은 포스트에 우선적으로 적용되며, **일반게시글 작성** 단계에서 유저가 작성하는 글의 제목과 내용을 텍스트로 결합하여 백터화하여 코사인 유사도를 계산하여 추천 태그를 생성합니다.

<br>

---

<br>

### **2️⃣ 학습 데이터**
<br>

#### 학습 데이터를 모으고 사용하는 과정은 다음과 같습니다.   

- 크롤링을 통하여 홈페이지 성격에 맞는 식물에 관련 된 글의 제목, 내용, 태그를 크롤링하여 사용
- 학습 데이터는 csv로 추출하여 ai_post 테이블에 정보를 담아 사용

    <details>
    <summary>ai_post 데이터 프레임 생성 코드</summary>

    ```
    def save_articles_from_csv(csv_file_path):
        try:
            # CSV 파일 열기
            with open(csv_file_path, 'r', encoding='utf-8-sig') as file:
                reader = csv.DictReader(file)
                member_queryset = Member.objects.all()
                # 각 행을 반복하며 Django 모델에 저장
                for row in reader:

                    # 필요한 정보 추출
                    title = row['title']
                    content = row['content']
                    tags = row['tag'].split(',')
                    tag_list = []
                    for tag in tags:
                        tag_list.append(tag)

                    post_data = {
                        'post_title': title,
                        'post_content': content,
                        'post_tags': tag_list,
                    }
                    post = AiPost.objects.create(**post_data)
            # 모든 데이터가 성공적으로 저장되었음을 반환
            return True
        except Exception as e:
            # 오류 발생 시 메시지 출력 및 False 반환
            print(f"Error occurred while saving articles from CSV: {e}")
            return False

    class AiTest(TestCase):

        # CSV 파일 경로
        csv_file_path = '../pretraining_df.csv'

        # CSV 파일에서 데이터를 Django 모델에 저장
        if save_articles_from_csv(csv_file_path):
            print("Articles saved successfully.")
        else:
            print("Failed to save articles.")


    ```

    </details>
<br>

---
<br>

### **3️⃣ 코사인 유사도 분석**


#### 코사인 유사도 분석 알고리즘은 다음과 같습니다.

1. 화면에서 입력된 제목과 내용을 post-module.js의 aipost 함수에서 fatch 를 통해 post 방식으로 전달



2. view 에서 제목과 내용을 하나의 텍스트로 결합
    <details>
    <summary>코드</summary>

    ```
        # Concatenate features
        input_title = data.get('title')
        input_content = data.get('content')

    ```

    </details>

<br>

3. 사전 훈련 데이터에서 제목과 내용 피처를 가져와 concatenate 함수를 통하여 하나의 문장으로 결합
    <details>
    <summary>코드</summary>

    ```
    @staticmethod
    def concatenate(titles, contents):
        return [f"{title} {content}" for title, content in zip(titles, contents)]
 
 
        titles = AiPost.objects.all().values_list('post_title', flat=True)
        contents = AiPost.objects.all().values_list('post_content', flat=True)
        features = self.concatenate(titles, contents)


    ```

    </details>

<br>    

4. TF-IDF vectorizer를 통해서 사전 훈련 데이터를 벡터화하여 단어의 빈도 수 계산
    <details>
    <summary>코드</summary>

    ```
    # TF-IDF 벡터화
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(features)
    ```

    </details>

<br>    

5. 입력된 제목과 내용, 사전 훈련 데이터, vactorizer를 함수에 전달하여 입력된 내용을 벡터화 하고 코사인 유사도에 전달하여 분석 후 리턴
    <details>
    <summary>코드</summary>

    ```
    @staticmethod
    def find_similar_titles(input_title, tfidf_matrix, vectorizer):
        input_vec = vectorizer.transform([input_title])
        cosine_similarities = cosine_similarity(input_vec, tfidf_matrix).flatten()
        return cosine_similarities
    
    # 코사인 유사도 계산
        cosine_similarities = self.find_similar_titles(target, tfidf_matrix, vectorizer)

    ```
    </details>

<br>    

6. 분석한 유사도를 바탕으로 유사도 높은 순으로 정렬한 후 반복문을 통해서 5개의 포스트의 인덱스로 태그를 가져와 중복방지를 위하여 set에 담아준 후 list로 변환하여 화면에 fetch 로 전달

    <details>
    <summary>코드</summary>

    ```
    @staticmethod
    def get_tag_from_index(index):
        tags = AiPost.objects.filter(id=index).values_list('post_tags', flat=True)
        if tags.exists():
            return tags[0].split(',')
        return ['없습니다']


        # 유사도 높은 순으로 정렬
        similar_indices = cosine_similarities.argsort()[::-1]
        print(similar_indices[1:6])
        tag_set = set()
        for idx in similar_indices[1:6]:  # 가장 유사한 5개의 포스트 선택
            print(cosine_similarities[idx])
            tags = self.get_tag_from_index(idx)
            print(tags)
            joined_str = ''.join(tags)
            cleaned_str = joined_str.replace("[", "").replace("]", "").replace("'", "").strip()
            cleaned_str = cleaned_str.split(" ")
            tag_set.update(cleaned_str)

        return Response(list(tag_set)[:5])

    ```
    </details>

<br>

---
<br>

### **4️⃣ 추천 알고리즘의 흐름**

<br>

#### 추천 알고리즘의 흐름은 다음과 같습니다.

1. 화면에서 제목 8글자 이상, 내용 20글자 이상 입력 시 ai 추천태그 checkbox 활성화

    > 활성화 전 
    > 
    > ![image](https://github.com/DianaKang0123/selleaf/assets/156397873/eddee58f-c7f7-4c47-99e8-5435dda62eca)
 

    > 활성화 후 
    > 
    > ![image-1](https://github.com/DianaKang0123/selleaf/assets/156397873/ea047f23-0d80-419d-b25e-bcf87c6af7be)


2. ai 추천태그 checkbox클릭시 post-module.js이 aiPost를 통하여 해당 정보 post 방식으로 view로 전달
    > 클릭 후 
    > 
    > <img src='https://github.com/DianaKang0123/selleaf/assets/156397873/9993d1ab-4e82-4cf3-8cea-fa5bba932ad4'> <img src='https://blog.kakaocdn.net/dn/b9jflW/btq6mHPadGm/L01EqsmmKj08ek5ThUZh2K/img.gif' width="20" height='25' />



3. view에서 위에 실행한 코사인 유사도 분석 후 결과를 return
4. 리턴된 값을 post -module에서 aipost함수의 fetch를 통해 resonse로 return 후 create-post.js로 전달  

    <sub>※이때 fetch 과정에 로딩 처리를 하여 대기 시 로딩 애니메이션을 적용</sub>  

5. create-post.js에서 전달 받은 태그를 innerHtml로 태그 위치에 삽입
    > 태그가 전달 된 모습 
    > 
    > ![image-3](https://github.com/DianaKang0123/selleaf/assets/156397873/71b0bdd9-2ab9-403d-933c-2cd1e925c394)


6. 사용자는 추천 태그 삭제 후 본인이 원하는 태그 삽입 가능

---
<br>

### **5️⃣ 결과**

<br>

> #### 🚩 입력 제목, 내용
> 
> ![image-4](https://github.com/DianaKang0123/selleaf/assets/156397873/240a9eda-2dd5-4af3-b853-54e1f455257d)


> #### 🚩 추천 태그
> 
> ![image-5](https://github.com/DianaKang0123/selleaf/assets/156397873/864b0e9b-77f9-4659-b926-5b37aaeacff8)
     
### **6️⃣ 기대 효과**
1. SEO(검색 엔진 최적화) 및 검색 가시성 향상

- 태그의 수동 작성에서 발생할 수 있는 오류나 누락을 방지
- 자동 태그를 통하여 키워드의 정확성을 높이고, 이를 통한 검색을 통하여 사이트의 가시성을 향상 시킴 

2. 사용자 생성 콘텐츠(UGC) 촉진

- 커뮤니티 태그를 통해 이용자들이 제품이나 브랜드와 관련된 콘텐츠를 생성하고 공유하도록 유도하여 사이트의 성장에 기여하고, 기업 등의 매체를 유인
- 태그로 긍정적인 입소문을 생성, 사이트와 작성 게시글의 신뢰성을 높이는 데 기여
- 사용자의 콘텐츠 생산과 사이트 체류 시간이 증가하여 커뮤니티 활성화에 기여

3. 맞춤형 콘텐츠 제공

- 사용자의 관심사를 보다 세분화하여 맞춤 콘텐츠 제공을 가능하게 하고, 사용자의 만족도 향상

4. 데이터 관리 및 분석

- 태그를 통하여 데이터를 관리하고 분석하는데 도움을 주고, 여기서 파생되는 인사이트로 사이트의 질을 향상시킴

