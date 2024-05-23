autosize($("textarea"));

const dropBoxGuide = document.querySelector("#drop-box-guide");
const dropBoxRequired = document.querySelector("#drop-box-required");
const downArrowIcon = document.querySelectorAll(".down-arrow");
const dropBoxes = document.querySelectorAll(".expanded");
const titleInput = document.querySelector(".title-input");
const titleInputCount = document.querySelector(".count");
const contentCount = document.querySelector(".content-count");
const contentTextArea = document.querySelector(".content-text-area");
const textInputContainer = document.querySelector(
    ".content-text-input-container"
);

const markIconWrap = document.querySelector(".mark-icon-wrap");

dropBoxGuide.addEventListener("click", () => {
    downArrowIcon[0].classList.toggle("down-arrow-open");
    dropBoxes[0].classList.toggle("guide-open");
});

dropBoxRequired.addEventListener("click", () => {
    downArrowIcon[1].classList.toggle("down-arrow-open");
    dropBoxes[1].classList.toggle("required-open");
});
let titleFlag = false
titleInput.addEventListener("keyup", (e) => {
    titleInputCount.innerText = 0;
    e.target.value && (titleInputCount.innerText = e.target.value.length);
    titleFlag = !!e.target.value;
    submitDisabledFn()
});

textInputContainer.addEventListener("click", () => {
    contentTextArea.focus();
});

// contentTextArea.addEventListener("click", () => {
//   markIconWrap.classList.add("wrap-open");
// });

const imgFileInput = document.querySelector("#img-file");
const prevImgBox = document.querySelector(".prev-img-box");
const cancel = document.querySelector(".cancel");

let fileFlag = false
imgFileInput.addEventListener("change", (e) => {
    const [file] = e.target.files;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.addEventListener("load", (e) => {
        const path = e.target.result;
        cancel.style.display = "block";
        path.includes("image")
            ? ((prevImgBox.style.backgroundImage = `url(${path})`),
                (prevImgBox.style.zIndex = "5"))
            : (prevImgBox.style.backgroundImage = `url('images/attach.png')`);
    });
    fileFlag = !!e.target.value;
    submitDisabledFn()
});
cancel.addEventListener("click", (e) => {
    prevImgBox.style.backgroundImage = "";
    prevImgBox.style.zIndex = "-5";
    e.target.style.display = "none";
    imgFileInput.value = "";
    fileFlag = !!e.target.value;
    submitDisabledFn()
});

const tag = document.querySelector(".tag");
const tagInput = document.querySelector(".tag-input");
const tagList = document.querySelector(".tag-list");
const emptyValue = document.querySelector(".empty-value");

let tagFlag = false
tagInput.addEventListener("keyup", (e) => {
    e.preventDefault()
    let value = e.target.value;
    if (e.keyCode === 13 && e.target.value) {
        const items = tagList.querySelectorAll(".tag-list > span");
        if (items.length + 1 <= 5) {
            e.target.value = "";
            const tagItem = document.createElement("span");
            tagItem.classList.add("tag");
            tagItem.innerHTML = `
      <span class="tag-left-line">#</span>
        <div class="tag-inner">
          <span class="tag-text">
            ${value}
          </span>
          <button type="button" class="tag-cancel-btn">
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="#a2a9b4"
              viewBox="0 0 14 14"
              width="10px"
              height="10px"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
              />
            </svg>
          </button>
        </div>
        `;
            tagList.appendChild(tagItem);
            const tags = document.querySelectorAll(".tag");
            tags.forEach((item) => {
                const canceltag = item.querySelector(".tag-cancel-btn");
                canceltag.addEventListener("click", () => {
                    item.remove();
                    tagFlag = items.length >= 0;
                    submitDisabledFn()
                });
            });
        }
        tagFlag = items.length >= 0;
        submitDisabledFn()
    }
});
tagInput.addEventListener("focus", (e) => {
    e.target.style.boxShadow = "0 0 0 3px rgba(53,197,240,.3)";
});
tagInput.addEventListener("blur", (e) => {
    e.target.style.boxShadow = "";
});
const plantSelections = document.querySelectorAll(".plant-selection");
plantSelections.forEach((plantSelection) => {
    plantSelection.addEventListener("click", (e) => {
        plantSelection.classList.toggle("select-on");
    });
});

const checkboxes = document.querySelectorAll('input[type="checkbox"]');


checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
        checkboxes.forEach((cb) => {
            const label = cb.closest('.plant-selection');
            if (label) {
                if (cb.checked) {
                    label.classList.add("select-on");
                } else {
                    label.classList.remove("select-on");
                }
            }
        });
    });
});

let textareaFlag = false
contentTextArea.addEventListener("keyup", (e) => {
    contentCount.innerText = contentTextArea.value.length
    textareaFlag = !!e.target.value
    submitDisabledFn()
})


const selectElement = document.querySelector("select[name='post-category']");

let selectedFlag = false
selectElement.addEventListener("change", () => {
    selectedFlag = true
    submitDisabledFn()
});
let checkedFlag = false
checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('click', (e) => {
        let checkedCount = 0;
        checkboxes.forEach(item => {
            if (item.checked) {
                checkedCount++;
            } else {
                checkedCount--;
            }
        });
        checkedFlag = checkedCount >= -6;
        submitDisabledFn()
    });
});


const publishBtn = document.querySelector('.publish-btn')



const checkboxLabel = document.querySelector('.selection')
const aititle = document.querySelector('.required-info-item-title-box2')

document.addEventListener('DOMContentLoaded', () => {
    const titleInput = document.querySelector('.title-input');
    const contentTextArea = document.querySelector('.content-text-area');
    const aiCheckbox = document.querySelector('.ai-checkbox');

    if (!titleInput || !contentTextArea || !aiCheckbox) {
        console.error('One or more elements were not found.');
        return;
    }

    const toggleCheckbox = () => {
        const titleLength = titleInput.value.length;
        const contentLength = contentTextArea.value.length;

        if (titleLength >= 8 && contentLength >= 20) {
            aiCheckbox.disabled = false;
            aiCheckbox.hidden = true;
            checkboxLabel.style.backgroundColor = '#fff'

        } else {
            aiCheckbox.disabled = true;
            aiCheckbox.hidden = true;
        }
    };


    const sendPost = async () => {
        aititle.style.color = '#000'
        checkboxLabel.style.backgroundColor = '#C06888';
        const postTitle = titleInput.value;
        const postContent = contentTextArea.value;
        const response = await postService.aiPost(postTitle, postContent);
        await showtags(response);
    };


    titleInput.addEventListener('input', toggleCheckbox);
    contentTextArea.addEventListener('input', toggleCheckbox);
    aiCheckbox.addEventListener('click', sendPost);
});

const form = document.querySelector('form[name="post-create-form"]');
const aiTagsInput = document.getElementById('post-tags');


const setTagsInputValue = () => {
  const tags = Array.from(tagList.querySelectorAll('.tag-text')).map(tag => tag.textContent.trim());
  aiTagsInput.value = tags.join(',');
};


const wrap = document.querySelector('.tag-list')
const innerTag = wrap.querySelectorAll('.tag')
const showtags = (tags) => {
    let text = ``
    tags.forEach((tag) => {
        if (tag) {
            text += `
      <span class="tag">
          <span class="tag-left-line">#</span>
            <div class="tag-inner">
              <span class="tag-text">
                ${tag}
              </span>
              <button type="button" class="tag-cancel-btn">
                <svg
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#a2a9b4"
                  viewBox="0 0 14 14"
                  width="10px"
                  height="10px"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
              </button>
            </div>
        </span>
        `
        }


    });
    wrap.innerHTML = text
    setTagsInputValue()
    tagFlag = innerTag.length >= 0;
    const aitags = document.querySelectorAll(".tag");
    aitags.forEach((item) => {

        const canceltag = item.querySelector(".tag-cancel-btn");
        canceltag.addEventListener("click", () => {
            item.remove();
            const tagList = document.querySelector('.tag-list')
            const ttags = tagList.querySelectorAll('.tag')
            tagFlag = ttags.length >= 0;
            ttags.length === 0 && (
                checkboxLabel.style.backgroundColor = '#fff',
                aititle.style.color = '#a4acb3')
        });

    });


}

form.addEventListener('submit', (event) => {
  setTagsInputValue();
});

const submitDisabledFn = () => {
    console.log(textareaFlag, checkedFlag, selectedFlag,fileFlag, titleFlag, tagFlag)
    publishBtn.disabled = !(textareaFlag && checkedFlag && selectedFlag && fileFlag && titleFlag && tagFlag);
}