// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Initialize all functionality
  initTheme();
  initMobileNavigation();
  initSmoothScrolling();
  initScrollAnimations();
  initRevealOnScroll();
  initContactForm();
  renderProjects();
  renderSkills();
  renderBlogPosts();
  updateCurrentYear();
  initIntersectionObserver();
  initPageStagger();
  initVcardUI();

  // Add loaded class for CSS transitions
  document.body.classList.add("loaded");
});

/**
 * vCard UI: sidebar toggle, navigation between articles, simple form enabling
 */
function initVcardUI() {
  // Sidebar show/hide more
  document.querySelectorAll("[data-sidebar-btn]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const more = document.querySelector("[data-sidebar-more]");
      if (!more) return;
      const expanded = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", (!expanded).toString());
      more.hidden = expanded; // toggle
    });
  });

  // Navigation between articles
  document.querySelectorAll("[data-nav-link]").forEach((link) => {
    link.addEventListener("click", () => {
      const target = link.getAttribute("data-target");
      if (!target) return;
      // update active nav link
      document
        .querySelectorAll("[data-nav-link]")
        .forEach((l) => l.classList.remove("active"));
      link.classList.add("active");
      // show target article
      document.querySelectorAll("article[data-page]").forEach((a) => {
        if (a.getAttribute("data-page") === target) {
          a.hidden = false;
          a.classList.add("visible");
        } else {
          a.hidden = true;
          a.classList.remove("visible");
        }
      });
    });
  });

  // Enable submit when form inputs filled
  document.querySelectorAll("[data-form]").forEach((form) => {
    const inputs = form.querySelectorAll("[data-form-input]");
    const btn = form.querySelector("[data-form-btn]");
    function validate() {
      const ok = Array.from(inputs).every((i) => i.value.trim() !== "");
      if (btn) btn.disabled = !ok;
    }
    inputs.forEach((i) => i.addEventListener("input", validate));
    validate();
  });
}

/**
 * Theme Management
 */
function initTheme() {
  const themeToggle = document.querySelector(".theme-toggle");
  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

  // Get saved theme or use system preference
  const savedTheme = localStorage.getItem("theme");
  const systemTheme = prefersDarkScheme.matches ? "dark" : "light";
  const initialTheme = savedTheme || systemTheme;

  // Apply initial theme
  setTheme(initialTheme);

  // Theme toggle event listener
  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  });

  // Listen for system theme changes
  prefersDarkScheme.addEventListener("change", (e) => {
    if (!localStorage.getItem("theme")) {
      setTheme(e.matches ? "dark" : "light");
    }
  });
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);

  // Dispatch custom event for other components
  document.dispatchEvent(new CustomEvent("themechange", { detail: { theme } }));

  // Update button aria-label
  const themeToggle = document.querySelector(".theme-toggle");
  const label =
    theme === "dark" ? "Switch to light theme" : "Switch to dark theme";
  themeToggle.setAttribute("aria-label", label);
}

/**
 * Mobile Navigation
 */
function initMobileNavigation() {
  const menuToggle = document.querySelector(".mobile-menu-toggle");
  const mobileNav = document.querySelector(".mobile-nav");
  const mobileLinks = document.querySelectorAll(".mobile-nav-link");

  if (!menuToggle) return;

  menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", !isExpanded);
    mobileNav.classList.toggle("active");
    mobileNav.setAttribute("aria-hidden", isExpanded);

    // Toggle body scroll
    document.body.style.overflow = isExpanded ? "" : "hidden";
  });

  // Close menu when clicking on links
  mobileLinks.forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle.setAttribute("aria-expanded", "false");
      mobileNav.classList.remove("active");
      mobileNav.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    });
  });

  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    if (!mobileNav.contains(e.target) && !menuToggle.contains(e.target)) {
      menuToggle.setAttribute("aria-expanded", "false");
      mobileNav.classList.remove("active");
      mobileNav.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }
  });

  // Close menu on escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      menuToggle.setAttribute("aria-expanded", "false");
      mobileNav.classList.remove("active");
      mobileNav.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }
  });
}

/**
 * Smooth Scrolling
 */
function initSmoothScrolling() {
  const navLinks = document.querySelectorAll('a[href^="#"]');

  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href");

      // Skip if it's not an internal link
      if (href === "#" || href.startsWith("#!")) return;

      e.preventDefault();

      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        // Update active nav link
        updateActiveNavLink(href);

        // Smooth scroll to target
        const headerHeight = document.querySelector(".header").offsetHeight;
        const targetPosition = targetElement.offsetTop - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });

        // Update URL without jumping
        history.pushState(null, null, href);
      }
    });
  });

  // Update active link on scroll
  window.addEventListener("scroll", debounce(updateActiveNavOnScroll, 100));
}

function updateActiveNavLink(href) {
  // Remove active class from all links
  document.querySelectorAll(".nav-link, .mobile-nav-link").forEach((link) => {
    link.classList.remove("active");
  });

  // Add active class to clicked link
  const activeLink = document.querySelector(`a[href="${href}"]`);
  if (activeLink) {
    activeLink.classList.add("active");
  }
}

function updateActiveNavOnScroll() {
  const sections = document.querySelectorAll("section[id]");
  const scrollPosition = window.scrollY + 100;

  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute("id");

    if (
      scrollPosition >= sectionTop &&
      scrollPosition < sectionTop + sectionHeight
    ) {
      updateActiveNavLink(`#${sectionId}`);
    }
  });
}

/**
 * Scroll Animations
 */
function initScrollAnimations() {
  // Add scroll effect to header (use rAF to smooth toggling)
  let lastKnownScroll = 0;
  let ticking = false;
  window.addEventListener("scroll", () => {
    lastKnownScroll = window.scrollY;
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const header = document.querySelector(".header");
        if (lastKnownScroll > 50) header.classList.add("scrolled");
        else header.classList.remove("scrolled");
        ticking = false;
      });
      ticking = true;
    }
  });
}

/**
 * Intersection Observer for animations
 */
function initIntersectionObserver() {
  const observerOptions = {
    root: null,
    rootMargin: "0px 0px -5% 0px",
    threshold: 0.12,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Use requestAnimationFrame to batch DOM writes for smoother paint
        window.requestAnimationFrame(() =>
          entry.target.classList.add("visible"),
        );
      }
    });
  }, observerOptions);

  // Observe all elements with fade-in class
  document.querySelectorAll(".fade-in").forEach((element) => {
    observer.observe(element);
  });
}

/* Page entrance staggering: sets a --seq variable on header, sections, and footer so CSS can stagger the entrance */
function initPageStagger() {
  // Respect user preference for reduced motion
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll(".stagger").forEach((el) => {
      el.style.opacity = 1;
      el.style.transform = "none";
    });
    document.querySelectorAll(".logo").forEach((logo) => {
      logo.style.opacity = 1;
    });
    return;
  }

  const elements = [];
  const header = document.querySelector(".header");
  if (header) elements.push(header);
  document.querySelectorAll("main > section").forEach((s) => elements.push(s));
  const footer = document.querySelector(".footer");
  if (footer) elements.push(footer);

  elements.forEach((el, i) => {
    el.style.setProperty("--seq", i);
    el.classList.add("stagger");

    // assign per-child variables for nicer staggered entrance
    const children = el.querySelectorAll(":scope > *");
    children.forEach((c, j) => {
      c.classList.add("stagger-child");
      c.style.setProperty("--child", j);
    });
  });

  // Ensure the logo will animate as well (small delay)
  const logo = document.querySelector(".logo");
  if (logo) {
    logo.style.setProperty("--seq", 0);
    logo.classList.add("stagger-child");
    logo.style.setProperty("--child", 0);
  }

  // Add a global helper class to apply smooth transitions to interactive elements
  document.body.classList.add("animate-smooth");
}

/**
 * Projects Data & Rendering
 */
const projectsData = [
  {
    id: 1,
    title: "E-Commerce Platform",
    description:
      "A full-featured online shopping platform with cart, checkout, and payment integration.",
    tech: ["React", "Node.js", "MongoDB", "Stripe"],
    icon: "🛒",
  },
  {
    id: 2,
    title: "Task Management App",
    description:
      "Collaborative task management application with real-time updates and team features.",
    tech: ["Vue.js", "Express", "Socket.io", "PostgreSQL"],
    icon: "✅",
  },
  {
    id: 3,
    title: "Weather Dashboard",
    description:
      "Real-time weather application with interactive maps and detailed forecasts.",
    tech: ["JavaScript", "API Integration", "Chart.js", "CSS Grid"],
    icon: "🌤️",
  },
  {
    id: 4,
    title: "Portfolio Website",
    description:
      "Responsive portfolio website with dark mode, animations, and contact form.",
    tech: ["HTML5", "CSS3", "JavaScript", "Netlify"],
    icon: "💼",
  },
  {
    id: 5,
    title: "Fitness Tracker",
    description:
      "Mobile-first fitness application with workout logging and progress tracking.",
    tech: ["React Native", "Firebase", "Redux", "Chart.js"],
    icon: "💪",
  },
  {
    id: 6,
    title: "Recipe Finder",
    description:
      "Recipe discovery app with ingredient search and meal planning features.",
    tech: ["Next.js", "Spoonacular API", "Tailwind CSS", "Vercel"],
    icon: "🍳",
  },
];

function renderProjects() {
  const projectsGrid = document.querySelector(".projects-grid");
  if (!projectsGrid) return;

  projectsGrid.innerHTML = projectsData
    .map(
      (project) => `
        <article class="project-card fade-in">
            <div class="project-image">
                <span aria-hidden="true">${project.icon}</span>
            </div>
            <div class="project-content">
                <h3 class="project-title">${project.title}</h3>
                <p class="project-description">${project.description}</p>
                <div class="project-tech">
                    ${project.tech.map((tech) => `<span class="tech-tag">${tech}</span>`).join("")}
                </div>
                <div class="project-links">
                    <a href="#" class="project-link">View Project →</a>
                    <a href="#" class="project-link">Source Code →</a>
                </div>
            </div>
        </article>
    `,
    )
    .join("");
}

/**
 * Skills Data & Rendering
 */
const skillsData = {
  Frontend: [
    { name: "HTML5 & CSS3", level: 5 },
    { name: "JavaScript (ES6+)", level: 3 },
    { name: "TypeScript", level: 2 },
  ],
  Backend: [
    { name: "Node.js", level: 2 },
    { name: "Python", level: 4 },
  ],
  "Tools & Others": [
    { name: "Git & GitHub", level: 5 },
    { name: "Docker", level: 3 },
  ],
};

function renderSkills() {
  const skillsContainer = document.querySelector(".skills-container");
  if (!skillsContainer) return;

  skillsContainer.innerHTML = Object.entries(skillsData)
    .map(
      ([category, skills]) => `
        <div class="skill-category fade-in">
            <h3>${category}</h3>
            <ul class="skill-list">
                ${skills
                  .map(
                    (skill) => `
                    <li class="skill-item">
                        <span class="skill-name">${skill.name}</span>
                        <div class="skill-level" aria-label="Skill level: ${skill.level} out of 5">
                            ${Array.from(
                              { length: 5 },
                              (_, i) =>
                                `<span class="level-dot ${i < skill.level ? "filled" : ""}"></span>`,
                            ).join("")}
                        </div>
                    </li>
                `,
                  )
                  .join("")}
            </ul>
        </div>
    `,
    )
    .join("");
}

/**
 * Blog Posts Data & Rendering
 */
const blogPostsData = [
  {
    id: 1,
    title: "The Power of Semantic HTML",
    date: "2024-03-15",
    excerpt:
      "Learn how semantic HTML improves accessibility, SEO, and maintainability of your web projects.",
    icon: "📝",
  },
  {
    id: 2,
    title: "Mastering CSS Grid",
    date: "2024-03-10",
    excerpt:
      "A comprehensive guide to creating complex layouts with CSS Grid in modern web development.",
    icon: "🎨",
  },
  {
    id: 3,
    title: "JavaScript Performance Tips",
    date: "2024-03-05",
    excerpt:
      "Optimize your JavaScript code for better performance and smoother user experiences.",
    icon: "⚡",
  },
  {
    id: 4,
    title: "Building Accessible Forms",
    date: "2024-02-28",
    excerpt:
      "Best practices for creating forms that are usable by everyone, including people with disabilities.",
    icon: "♿",
  },
];

function renderBlogPosts() {
  const blogPosts = document.querySelector(".blog-posts");
  if (!blogPosts) return;

  blogPosts.innerHTML = blogPostsData
    .map(
      (post) => `
        <article class="blog-post fade-in">
            <div class="post-image">
                <span aria-hidden="true">${post.icon}</span>
            </div>
            <div class="post-content">
                <time datetime="${post.date}" class="post-date">
                    ${new Date(post.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                </time>
                <h3 class="post-title">${post.title}</h3>
                <p class="post-excerpt">${post.excerpt}</p>
                <a href="#" class="read-more">Read Article →</a>
            </div>
        </article>
    `,
    )
    .join("");
}
const mobileBtn = document.querySelector(".mobile-menu-toggle");
const closeBtn = document.querySelector(".close-menu");
const mobileNav = document.querySelector(".mobile-nav");
const mobileLinks = document.querySelectorAll(".mobile-nav-link");

// Function to toggle menu
const toggleMenu = () => {
  mobileNav.classList.toggle("active");
  // Prevent scrolling when menu is open
  document.body.style.overflow = mobileNav.classList.contains("active")
    ? "hidden"
    : "";
};

mobileBtn.addEventListener("click", toggleMenu);
closeBtn.addEventListener("click", toggleMenu);

// Close menu when a link is clicked
mobileLinks.forEach((link) => {
  link.addEventListener("click", toggleMenu);
});
/**
 * Contact Form Handling
 */
function initContactForm() {
  const contactForm = document.getElementById("contact-form");
  if (!contactForm) return;

  // Form validation
  const validateField = (field) => {
    const value = field.value.trim();
    const errorElement = field.parentElement.querySelector(".error-message");

    if (field.required && !value) {
      errorElement.textContent = "This field is required";
      field.setAttribute("aria-invalid", "true");
      return false;
    }

    if (field.type === "email" && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errorElement.textContent = "Please enter a valid email address";
        field.setAttribute("aria-invalid", "true");
        return false;
      }
    }

    errorElement.textContent = "";
    field.setAttribute("aria-invalid", "false");
    return true;
  };

  // Real-time validation
  contactForm.querySelectorAll("input, textarea").forEach((field) => {
    field.addEventListener("input", () => validateField(field));
    field.addEventListener("blur", () => validateField(field));
  });

  // Form submission
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Validate all fields
    const fields = contactForm.querySelectorAll("input, textarea");
    const isValid = Array.from(fields).every((field) => validateField(field));

    if (!isValid) {
      showFormFeedback("Please fix the errors above", "error");
      return;
    }

    // Get form data
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);

    // Show loading state
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = "Sending...";
    submitButton.disabled = true;

    try {
      // Send to serverless endpoint
      const response = await fetch("/api/send-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          message: data.message,
          hp: data.hp || "",
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || "Failed to send message");
      }

      showFormFeedback(
        result.message ||
          "Message sent successfully! I'll get back to you soon.",
        "success",
      );
      contactForm.reset();

      n; // Clear validation errors
      contactForm.querySelectorAll(".error-message").forEach((el) => {
        el.textContent = "";
      });
    } catch (error) {
      showFormFeedback(
        error.message || "Something went wrong. Please try again later.",
        "error",
      );
      console.error("Form submission error:", error);
    } finally {
      // Reset button state
      submitButton.innerHTML = originalText;
      submitButton.disabled = false;
    }
  });
}

function showFormFeedback(message, type) {
  const feedbackElement = document.querySelector(".form-feedback");
  if (!feedbackElement) return;

  feedbackElement.textContent = message;
  feedbackElement.className = `form-feedback ${type}`;

  // Auto-hide after 5 seconds
  setTimeout(() => {
    feedbackElement.textContent = "";
    feedbackElement.className = "form-feedback";
  }, 5000);
}

// simulateFormSubmission removed — live endpoint now used (see api/send-contact.js for serverless implementation)

/**
 * Utility Functions
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function updateCurrentYear() {
  const yearElement = document.getElementById("current-year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

/**
 * Resume Download Handling
 */
document.addEventListener("click", (e) => {
  if (e.target.closest("a[download]")) {
    const link = e.target.closest("a[download]");
    const fileName = link.getAttribute("download");

    // In a real implementation, you would have an actual PDF file
    // For demo purposes, we'll create a placeholder
    if (!link.getAttribute("href").includes(".pdf")) {
      e.preventDefault();

      // Create and trigger download of a placeholder
      const content = `Alex Morgan - Professional Resume\n\nContact: hello@alexmorgan.dev\nWebsite: alexmorgan.dev\n\nThis is a demo resume download. In a real implementation, this would be a PDF file.`;
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);

      const tempLink = document.createElement("a");
      tempLink.href = url;
      tempLink.download = fileName;
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
      URL.revokeObjectURL(url);
    }
  }
});

/**
 * Performance Optimizations
 */
// Preload critical images when page is idle
if ("requestIdleCallback" in window) {
  window.requestIdleCallback(() => {
    // Preload any critical images here
    const images = document.querySelectorAll("img[data-src]");
    images.forEach((img) => {
      img.src = img.getAttribute("data-src");
      img.removeAttribute("data-src");
    });
  });
}

// Service Worker registration (optional)
if ("serviceWorker" in navigator && window.location.protocol === "https:") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.log("Service Worker registration failed:", error);
    });
  });
}

/* ========================
   1. Typewriter Effect
   ======================== */
class TypeWriter {
  constructor(txtElement, words, wait = 3000) {
    this.txtElement = txtElement;
    this.words = words;
    this.txt = "";
    this.wordIndex = 0;
    this.wait = parseInt(wait, 10);
    this.type();
    this.isDeleting = false;
  }

  type() {
    const current = this.wordIndex % this.words.length;
    const fullTxt = this.words[current];

    if (this.isDeleting) {
      this.txt = fullTxt.substring(0, this.txt.length - 1);
    } else {
      this.txt = fullTxt.substring(0, this.txt.length + 1);
    }

    this.txtElement.innerHTML = `<span class="txt">${this.txt}</span>`;

    let typeSpeed = 200; // Normal typing speed

    if (this.isDeleting) {
      typeSpeed /= 2; // Delete faster
    }

    if (!this.isDeleting && this.txt === fullTxt) {
      typeSpeed = this.wait; // Pause at end
      this.isDeleting = true;
    } else if (this.isDeleting && this.txt === "") {
      this.isDeleting = false;
      this.wordIndex++;
      typeSpeed = 500; // Pause before new word
    }

    setTimeout(() => this.type(), typeSpeed);
  }
}

function initTypeWriter() {
  const txtElement = document.querySelector(".txt-type");
  const words = JSON.parse(txtElement.getAttribute("data-words"));
  const wait = txtElement.getAttribute("data-wait");
  new TypeWriter(txtElement, words, wait);
}

/* ========================
   2. 3D Tilt for Cards
   ======================== */
function init3DTilt() {
  // We attach this after projects are rendered
  setTimeout(() => {
    const cards = document.querySelectorAll(".project-card");

    cards.forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calculate rotation (center is 0,0)
        const xRotation = -1 * ((y - rect.height / 2) / 20); // Rotate X based on Y pos
        const yRotation = (x - rect.width / 2) / 20; // Rotate Y based on X pos

        card.style.transform = `
                    perspective(1000px) 
                    scale(1.05)
                    rotateX(${xRotation}deg) 
                    rotateY(${yRotation}deg)`;
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform =
          "perspective(1000px) scale(1) rotateX(0) rotateY(0)";
      });
    });
  }, 100); // Slight delay to ensure DOM exists
}

/* ========================
   3. Scroll Animations
   ======================== */
function initRevealOnScroll() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          // Trigger counters if it's the stats section
          if (entry.target.querySelector(".counter")) {
            startCounters(entry.target);
          }
        }
      });
    },
    { threshold: 0.1 },
  );

  document
    .querySelectorAll(".reveal-on-scroll, .stagger-container")
    .forEach((el) => {
      observer.observe(el);
    });
}

function initScrollProgress() {
  const bar = document.getElementById("scroll-progress");
  window.addEventListener("scroll", () => {
    const winScroll =
      document.body.scrollTop || document.documentElement.scrollTop;
    const height =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    bar.style.width = scrolled + "%";
  });
}

/* ========================
   4. Number Counters
   ======================== */
function initCounters() {
  // Wrapper function called by observer
}

function startCounters(section) {
  const counters = section.querySelectorAll(".counter");
  counters.forEach((counter) => {
    const target = +counter.getAttribute("data-target");
    const count = +counter.innerText;
    const increment = target / 50; // speed

    if (count < target) {
      counter.innerText = Math.ceil(count + increment);
      setTimeout(() => startCounters(section), 30);
    } else {
      counter.innerText = target + "+";
    }
  });
}

/* Removed duplicate simplified projects/skills rendering (kept the more detailed implementations earlier). */

/* Utilities: initTheme and mobile menu handlers are defined earlier to avoid duplicates. */
