document.addEventListener('DOMContentLoaded', function() {
  function initializeUpcomingCarousel() {
    var wrapper = document.querySelector('.upcoming-carousel-wrapper');
    var dataSource = document.getElementById('upcoming-carousel-widgets');
    var sectionContainer = document.querySelector('.upcoming-carousel-section');

    if (!wrapper || !dataSource || !sectionContainer) {
      if (sectionContainer) sectionContainer.style.display = 'none';
      return;
    }

    wrapper.id = 'upcoming-carousel';
    var imageWidgets = dataSource.querySelectorAll('.widget.Image');
    if (imageWidgets.length === 0) {
      sectionContainer.style.display = 'none';
      return;
    }

    var cardsHtml = '';
    imageWidgets.forEach(function(widget) {
      if (widget.style.display === 'none' || widget.classList.contains('hidden')) return;
      
      var hiddenData = widget.querySelector('.hidden-widget-data');
      if (!hiddenData) return;

      var title = (hiddenData.querySelector('.data-title') || {}).textContent || '';
      var caption = (hiddenData.querySelector('.data-caption') || {}).textContent || '';
      var link = (widget.querySelector('a') || {}).href || '#';
      var imageUrl = (widget.querySelector('img') || {}).src || '';

      if (imageUrl) {
        // --- START: REVISED LOGIC FOR THE NEW FORMAT ---
        const regex = /^\[(TV|Movie)\]\s*\[(.*?)\]\s*(.*)$/s; // 's' flag lets '.' match newlines
        const match = caption.match(regex);

        let typeHtml = '';
        let dateHtml = '';
        let descriptionText = caption; // Default to the full caption if format is wrong

        if (match) {
          const type = match[1];
          const dateString = match[2].trim();
          descriptionText = match[3].trim();

          // Build Type HTML for the thumbnail
          const typeClass = type.toLowerCase() === 'tv' ? 'type-tv' : 'type-movie';
          typeHtml = `<span class="upcoming-thumb-type ${typeClass}">${type}</span>`;

          // Build Date HTML for the content area
          if (dateString) {
            dateHtml = `<span class="upcoming-date">${dateString}</span>`;
          }
        }
        // --- END: REVISED LOGIC ---

        cardsHtml += '<div class="item">' +
          '<a class="upcoming-card" href="' + link + '">' +
            '<div class="upcoming-image">' +
              typeHtml + // The type badge is placed here, inside the image container
              '<img alt="' + title + '" src="' + imageUrl.replace(/\/s\d+(-[a-z0-9]+)*\//, '/w200-h300-c/') + '" loading="lazy"/>' +
            '</div>' +
            '<div class="upcoming-content">' +
              '<h4 class="upcoming-title">' + title + '</h4>' +
              dateHtml + // The date element
              '<p class="upcoming-description">' + descriptionText + '</p>' + // The remaining description
              '<div class="upcoming-button">More Details</div>' +
            '</div>' +
          '</a>' +
        '</div>';
      }
    });

    if (cardsHtml.trim() !== '') {
        wrapper.innerHTML = cardsHtml; 

        $(wrapper).addClass('owl-carousel owl-theme').owlCarousel({
            loop: false,
            margin: 16,
            nav: true,
            dots: false,
            navText: [
                '<svg fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 18l-6-6 6-6"/></svg>',
                '<svg fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 6l6 6-6 6"/></svg>'
            ],
            responsive: {
    0: {
        autoWidth: true,    
        stagePadding: 20, 
        margin: 12          
    },
    768: { items: 2, slideBy: 2 },
    1200: { items: 3, slideBy: 3 }
}
        });
        
    } else {
      sectionContainer.style.display = 'none';
    }
  }

  if (window.jQuery && jQuery.fn.owlCarousel) {
    initializeUpcomingCarousel();
  } else {
    setTimeout(initializeUpcomingCarousel, 500);
  }
});


function fetchAndRenderFilteredSwitch(container, settings) {
    const widget = container.closest('.widget');
    // --- START OF FIX: ADD THE GENRE LIST ---
    const validGenres = ["Action", "Action & Adventure", "Adventure", "Animation", "Comedy", "Crime", "Documentary", "Drama", "Family", "Fantasy", "History", "Horror", "Kids", "Music", "Mystery", "Reality", "Romance", "Sci-Fi & Fantasy", "Science Fiction", "Thriller", "War", "Western"];
    // --- END OF FIX ---
    const labels = settings.label ? settings.label.split(',').map(l => l.trim()) : [];
    const postsToShow = settings.maxResults || 6;
    const postsToFetch = 50; 
    const gridContainer = container.find('.switch-grid');
    const switchButton = container.find('.switch-button');
    let allPostsData = [];
    if (labels.length === 0) {
        gridContainer.html('<p class="error-msg">Widget Error: Please set at least one label in the shortcode.</p>');
        return;
    }
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    function displayFilteredPosts() {
        if (allPostsData.length === 0) {
            gridContainer.html("<p class='error-msg'>No posts found for the specified labels.</p>");
            switchButton.hide();
            return;
        }
        shuffleArray(allPostsData);
        const postsToDisplay = allPostsData.slice(0, postsToShow);
        const newHtml = postsToDisplay.map(post => {
            const durationHtml = post.duration ? `<span class="thumb-meta thumb-duration is-visible"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12" fill="none"><path d="M2 15C2.14277 15.4274 2.31023 15.8431 2.50062 16.2452M4.12547 18.7463C4.44158 19.1137 4.781 19.4596 5.14137 19.7814M9 22C8.55224 21.8557 8.11701 21.6824 7.69641 21.4822" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12 13.5C12.8284 13.5 13.5 12.8284 13.5 12C13.5 11.1716 12.8284 10.5 12 10.5C11.1716 10.5 10.5 11.1716 10.5 12M12 13.5C11.1716 13.5 10.5 12.8284 10.5 12M12 13.5V16M10.5 12H6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path></svg>${post.duration}</span>` : '<span class="thumb-meta thumb-duration"></span>';
            const ratingHtml = post.rating ? `<span class="thumb-meta thumb-rating is-visible"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="11" height="11" fill="none"><path d="M9.03658 10.8665L10.0925 12.9957C10.2364 13.2921 10.6204 13.5764 10.9444 13.6309L12.8582 13.9515C14.082 14.1571 14.37 15.0524 13.4881 15.9355L12.0003 17.4356C11.7483 17.6897 11.6103 18.1796 11.6883 18.5305L12.1142 20.3875C12.4502 21.8574 11.6763 22.426 10.3864 21.6578L8.59263 20.5871C8.26867 20.3935 7.73473 20.3935 7.40476 20.5871L5.61096 21.6578C4.3271 22.426 3.54719 21.8513 3.88315 20.3875L4.3091 18.5305C4.3871 18.1796 4.24911 17.6897 3.99714 17.4356L2.5093 15.9355C1.6334 15.0524 1.91537 14.1571 3.13923 13.9515L5.05302 13.6309C5.37099 13.5764 5.75494 13.2921 5.89893 12.9957L6.95481 10.8665C7.53075 9.71116 8.46665 9.71116 9.03658 10.8665Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M22 2L14 10M16 2L11 7M20 10L17 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path></svg>${post.rating}</span>` : '<span class="thumb-meta thumb-rating"></span>';
            const typeHtml = post.type ? `<span class="sub-meta-type is-visible">${post.type === 'TV Series' ? 'TV' : post.type}</span>` : '<span class="sub-meta-type"></span>';
            const yearHtml = post.year ? `<span class="sub-meta-year is-visible">${post.year}</span>` : '<span class="sub-meta-year"></span>';
            const ccHtml = post.subtitles ? `<span class="sub-meta-cc is-visible">${post.subtitles}</span>` : '<span class="sub-meta-cc"></span>';
            const micHtml = post.audio ? `<span class="sub-meta-mic is-visible"><svg viewBox="0 0 24 24" width="10" height="10"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" fill="currentColor"/></svg>${post.audio}</span>` : '<span class="sub-meta-mic"></span>';
            return `
            <article class="index-post" data-post-id="${post.id}">
              <a class="entry-image-wrap" href="${post.url}" title="${post.title}">
                <span class="entry-image" data-image="${post.imageUrl}"></span>
                <span class="entry-label">${post.label}</span>
                <div class="thumb-meta-overlay">${durationHtml}${ratingHtml}</div>
              </a>
              <div class="entry-header">
                <h2 class="entry-title"><a href="${post.url}">${post.title}</a></h2>
                <div class="card-sub-meta">
                  <div class="sub-meta-left">${typeHtml}${yearHtml}</div>
                  <div class="sub-meta-right">${ccHtml}${micHtml}</div>
                </div>
              </div>
            </article>`;
        }).join('');
        gridContainer.html(newHtml);
        setTimeout(function() {
            if (typeof $ === 'function') {
                $(window).trigger('scroll');
            }
        }, 50);
    }
    const labelPath = labels.map(l => encodeURIComponent(l)).join('/');
    const feedUrl = `/feeds/posts/default/-/${labelPath}?alt=json-in-script&max-results=${postsToFetch}`;
    $.ajax({
        url: feedUrl,
        type: 'get',
        dataType: 'jsonp',
        success: function(json) {
            if (!json.feed || !json.feed.entry) {
                displayFilteredPosts();
                return;
            }
            allPostsData = json.feed.entry.map(entry => {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = entry.content.$t;
                const $content = $(tempDiv);
                const poster = $content.find('img[alt="poster"]');
                const $metaDiv = $content.find('#extra-meta');
                
                // --- START OF FIX: This is the corrected label logic ---
                const allLabels = (entry.category || []).map(cat => cat.term);
                const displayLabel = allLabels.find(label => validGenres.includes(label)) || "";
                // --- END OF FIX ---
                
                return {
                    id: entry.id.$t.split('.post-')[1],
                    title: entry.title.$t,
                    url: (entry.link.find(link => link.rel === 'alternate') || {}).href,
                    imageUrl: poster.length ? poster.attr('src').replace(/\/s\d+(-[a-z0-9]+)*\//, '/w400-h600-c/') : 'https://resources.blogblog.com/img/blank.gif',
                    label: displayLabel,
                    duration: $metaDiv.find('.meta-duration').text().trim(),
                    rating: $metaDiv.find('.meta-rating').text().trim(),
                    year: $metaDiv.find('.meta-year').text().trim(),
                    type: $metaDiv.find('.meta-type').text().trim(),
                    subtitles: $metaDiv.find('.meta-subtitles').text().trim(),
                    audio: $metaDiv.find('.meta-audio').text().trim()
                };
            }).filter(Boolean);
            displayFilteredPosts();
            if(allPostsData.length > postsToShow) {
                switchButton.show();
            }
        },
        error: function() {
            gridContainer.html("<p class='error-msg'>Failed to load post feed.</p>");
        }
    });
    switchButton.on('click', displayFilteredPosts);
}
