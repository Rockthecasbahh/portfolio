import fs from 'fs';
import path from 'path';

function buildHomepagePageBuilderTemplateJson(profile: any) {
  return {
    root: {
      props: {
        title: `${profile.name} - Portfolio & 3D Motion Studio`,
        show3DRig: 'true',
        showTopographicContours: 'true',
        cameraRigScale: 1.15,
        videoLightIntensity: 3.0,
        videoLightColor: '#d9ebf4',
      },
    },
    zones: {},
    content: [
      {
        type: 'HeroStratum',
        props: {
          id: 'HeroStratum-home-1',
          taglineBadge: profile.tagline,
          fullName: profile.name,
          quoteText:
            'Six years translating global policy, development finance, and climate science into documentary cinema, Blender 3D animations, and Drupal 10 platforms.',
          portraitImage: '/assets/matteo-portrait-cutout.webp',
          primaryCta: {
            label: 'Explore Work',
            href: '#work',
            isExternal: 'false',
          },
          secondaryCta: {
            label: 'Download Styled CV',
            href: '/documents/Matteo_Casling_CV.pdf',
            isExternal: 'true',
          },
          floatingArtifactTitle: '3D & Motion Layers',
          floatingArtifactSubtitle: 'Blender + Three.js + GSAP',
          floatingArtifactHref: '#chapter-02',
          floatingArtifactImage: '/assets/projects/locust-3d-sculpture.png',
        },
      },
      {
        type: 'LogoWall',
        props: {
          id: 'LogoWall-home-1',
          ariaLabel: 'United Nations Agencies and Broadcast Partners',
          logos: [
            {
              name: 'UN DESA',
              alt: 'United Nations Department of Economic and Social Affairs (UN DESA)',
              imageUrl: '/assets/logos/un-desa.png',
            },
            {
              name: 'FAO / IAEA',
              alt: 'Joint FAO/IAEA Centre of Nuclear Techniques in Food and Agriculture',
              imageUrl: '/assets/logos/iaea-fao-navy.png',
            },
            {
              name: 'FAO',
              alt: 'Food and Agriculture Organization of the United Nations (FAO)',
              imageUrl: '/assets/logos/fao.png',
            },
            {
              name: 'IFAD',
              alt: 'International Fund for Agricultural Development (IFAD)',
              imageUrl: '/assets/logos/ifad.png',
            },
            {
              name: 'CIME',
              alt: 'Italian Council of the European Movement (CIME)',
              imageUrl: '/assets/logos/cime.png',
            },
            {
              name: 'PBS News',
              alt: 'PBS News',
              imageUrl: '/assets/logos/pbs.png',
            },
            {
              name: 'John Cabot University',
              alt: 'John Cabot University',
              imageUrl: '/assets/logos/jcu.png',
            },
          ],
        },
      },
      {
        type: 'EducationSkillsStratum',
        props: {
          id: 'EducationSkillsStratum-home-1',
          sectionId: 'education-skills',
          metrics: (profile.metrics || []).map((m: any, idx: number) => ({
            value: m.value,
            label: m.label,
            agency: m.agency,
            theme: idx % 2 === 0 ? 'paper' : 'cobalt',
          })),
          educationHeading: 'Education',
          educationItems: [
            {
              degree: 'MA Marketing, Buying Behaviour and Digital Communication',
              school: 'John Cabot University',
              years: '2019-2020',
            },
            {
              degree: 'Bachelor of Arts in Communications',
              school: 'John Cabot University',
              years: '2014-2017',
            },
            {
              degree: 'Diploma Scuola Superiore - Graphic Design',
              school: 'Liceo Artistico Via di Ripetta, Rome',
              years: '2008-2013',
            },
          ],
          skillsHeading: 'Skills & 3D Pipeline',
          softwareMeters: (profile.softwareMeters || []).map((sw: any) => ({
            name: sw.name,
            subtitle: sw.subtitle,
            segmentsFilled: sw.segmentsFilled ?? 8,
          })),
        },
      },
      {
        type: 'HorizontalShowreel',
        props: {
          id: 'HorizontalShowreel-home-1',
          sectionId: 'showreel',
          eyebrow: 'GSAP ScrollTrigger Horizontal Cinema',
          heading: '3D & Motion Showreel',
          subHeading:
            'Scroll to scrub through selected UN documentary films, Blender 3D scientific visualizations, and motion graphics.',
          onlyFeatured: 'true',
          pinnedProjects: [],
        },
      },
      {
        type: 'PortfolioChapters',
        props: {
          id: 'PortfolioChapters-home-1',
          sectionId: 'work',
          eyebrow: 'Curated Un-Portfolio Index (Chapters 01 - 05)',
          heading: 'Work Samples & Production Archive',
          subHeading:
            "Filter by audience focus or jump directly across the five chapters of Matteo's portfolio.",
          defaultTrackFilter: 'all',
          chapters: [
            {
              chapterNumber: '01',
              title: 'Videos & Documentary Cinema',
              subtitle:
                'COP28 Dubai, UN DESA Dominican Republic, and FAO Desert Locust field documentaries',
            },
            {
              chapterNumber: '02',
              title: 'Animations & 3D Visualization',
              subtitle:
                'Blender 3D biological & nuclear mechanics, After Effects motion systems, and IFAD evaluations',
            },
            {
              chapterNumber: '03',
              title: 'Editorial & Publication Design',
              subtitle:
                'Multilingual UN flagship reports, COP28 technical brochures, and SOP field manuals',
            },
            {
              chapterNumber: '04',
              title: 'Websites & Digital Platforms',
              subtitle:
                'Drupal 10 & WordPress full-stack institutional architectures for UN DESA FINS',
            },
            {
              chapterNumber: '05',
              title: 'Articles, Stories & Podcasts',
              subtitle:
                'World Water Day global photo essays and IFAD Roots podcasts from Nepal & Sierra Leone',
            },
          ],
          pinnedProjects: [],
        },
      },
      {
        type: 'ExperienceCascade',
        props: {
          id: 'ExperienceCascade-home-1',
          sectionId: 'experience',
          heading: 'Work Experience',
          subHeading:
            'Six years of end-to-end multimedia production, location directing, 3D animation, and Drupal/WordPress web architecture across United Nations agencies and broadcast news.',
          pinnedExperiences: [],
        },
      },
      {
        type: 'DossierContact',
        props: {
          id: 'DossierContact-home-1',
          sectionId: 'documents',
          heading: 'CV Dossiers & Strapi Headless CMS',
          description:
            "Download Matteo's original topographic PDF CVs and 13-page portfolio book, or launch the Strapi v5 Admin Panel to manage page blocks, projects, career milestones, and 3D topographic scenes visually.",
          dossierCards: [
            {
              title: 'UN & Policy CV',
              subtitle: 'Styled Topographic PDF',
              href: '/documents/Matteo_Casling_CV.pdf',
              iconType: 'pdf',
            },
            {
              title: 'Motion & Tech CV',
              subtitle: 'Video / 3D / Code PDF',
              href: '/documents/Matteo_Casling_CV_Tech_Motion.pdf',
              iconType: 'film',
            },
            {
              title: 'Un-Portfolio Book',
              subtitle: '13-Page Editorial PDF',
              href: '/documents/Matteo_Casling_Portfolio_Book.pdf',
              iconType: 'browser',
            },
          ],
          contactHeading: 'Direct Contact',
          email: profile.email,
          phone: profile.phone,
          location: profile.location,
          cmsLabel: 'Strapi v5 Admin',
          cmsUrl: 'http://localhost:1337/admin',
          primaryCta: {
            label: 'Send Email',
            href: `mailto:${profile.email}`,
            isExternal: 'false',
          },
          secondaryCta: {
            label: 'Open Strapi CMS',
            href: 'http://localhost:1337/admin',
            isExternal: 'true',
          },
        },
      },
    ],
  };
}

function buildGenericPageTemplateJson() {
  return {
    root: {
      props: {
        title: '{{title}}',
        show3DRig: 'true',
        showTopographicContours: 'true',
        cameraRigScale: 1.15,
        videoLightIntensity: 3.0,
        videoLightColor: '#d9ebf4',
      },
    },
    zones: {},
    content: [
      {
        type: 'SectionHeading',
        props: {
          id: 'SectionHeading-page-1',
          anchorLink: 'overview',
          heading: '{{title}}',
          subHeading: '{{description}}',
        },
      },
      {
        type: 'CardsGrid',
        props: {
          id: 'CardsGrid-page-1',
          heading: 'Featured Highlights',
          subHeading: 'Edit or drag new topographic components onto this page in Strapi Page Builder.',
          stratumTheme: 'ice',
          cards: [
            {
              heading: '3D & Scientific Motion',
              subHeading: 'Blender + Unreal Engine 5',
              text: 'Scientifically rigorous 3D visualizations and broadcast motion graphics.',
              badge: 'CHAPTER 02',
              href: '/#work',
            },
            {
              heading: 'Documentary Cinema',
              subHeading: 'COP28 & Global Field Production',
              text: 'Location directing, cinematography, and multilingual documentary storytelling.',
              badge: 'CHAPTER 01',
              href: '/#showreel',
            },
          ],
        },
      },
    ],
  };
}

async function ensurePageBuilderTemplatesAndSettings(
  strapi: any,
  profile: any,
  landingDoc: any,
  force = false
) {
  try {
    // 1. Ensure Default Homepage Template for api::landing-page.landing-page
    let homeTemplate = await strapi.documents('plugin::page-builder.template').findFirst({
      filters: { name: { $eq: 'landing-page.default' } },
    });

    if (homeTemplate && force) {
      await strapi.documents('plugin::page-builder.template').delete({
        documentId: homeTemplate.documentId,
      });
      homeTemplate = null;
    }

    if (!homeTemplate) {
      homeTemplate = await strapi.documents('plugin::page-builder.template').create({
        data: {
          name: 'landing-page.default',
          shortName: 'Default Portfolio Homepage',
          contentType: 'api::landing-page.landing-page',
          json: buildHomepagePageBuilderTemplateJson(profile),
        },
      });
      strapi.log.info(
        `[Portfolio Seed] Created Page Builder template 'landing-page.default' (${homeTemplate.documentId})`
      );
    }

    // 2. Ensure Standard Page Template for api::page.page
    let genericPageTemplate = await strapi.documents('plugin::page-builder.template').findFirst({
      filters: { name: { $eq: 'page.default' } },
    });

    if (genericPageTemplate && force) {
      await strapi.documents('plugin::page-builder.template').delete({
        documentId: genericPageTemplate.documentId,
      });
      genericPageTemplate = null;
    }

    if (!genericPageTemplate) {
      genericPageTemplate = await strapi.documents('plugin::page-builder.template').create({
        data: {
          name: 'page.default',
          shortName: 'Standard Topographic Page',
          contentType: 'api::page.page',
          json: buildGenericPageTemplateJson(),
        },
      });
      strapi.log.info(
        `[Portfolio Seed] Created Page Builder template 'page.default' (${genericPageTemplate.documentId})`
      );
    }

    // 3. Link api::landing-page.landing-page to homeTemplate if not already linked
    if (landingDoc && homeTemplate) {
      const populatedLanding = await strapi
        .documents('api::landing-page.landing-page')
        .findOne({
          documentId: landingDoc.documentId,
          populate: ['template'],
        });

      if (!populatedLanding?.template || force) {
        await strapi.documents('api::landing-page.landing-page').update({
          documentId: landingDoc.documentId,
          data: {
            template: homeTemplate.documentId,
          } as any,
          status: 'published',
        });
        strapi.log.info(
          `[Portfolio Seed] Linked Landing Page (${landingDoc.documentId}) to Page Builder template (${homeTemplate.documentId})`
        );
      }
    }

    // 4. Ensure plugin::page-builder.editor settings row exists with defaults.
    // The API key is only pre-filled when provided via env; otherwise it is entered
    // in Strapi Admin > Settings > Page Builder (which also registers the Editor URL).
    const existingSettingsRows = await strapi.db.query('plugin::page-builder.editor').findMany();
    const existingSettings = existingSettingsRows?.[0];
    const desiredApiKey =
      process.env.STRAPI_PAGE_BUILDER_API_KEY || existingSettings?.apiKey || null;

    if (!existingSettings) {
      await strapi.db.query('plugin::page-builder.editor').create({
        data: {
          apiKey: desiredApiKey,
          defaultContentType: 'api::landing-page.landing-page',
          defaultTemplateId: homeTemplate?.documentId || '',
          defaultContentId: landingDoc?.documentId || '',
          enforceTemplateShape: true,
        },
      });
      strapi.log.info('[Portfolio Seed] Configured Page Builder default settings.');
    } else if (!existingSettings.defaultContentType || force) {
      await strapi.db.query('plugin::page-builder.editor').update({
        where: { id: existingSettings.id },
        data: {
          apiKey: desiredApiKey,
          defaultContentType: 'api::landing-page.landing-page',
          defaultTemplateId: homeTemplate?.documentId || existingSettings.defaultTemplateId || '',
          defaultContentId: landingDoc?.documentId || existingSettings.defaultContentId || '',
          enforceTemplateShape: existingSettings.enforceTemplateShape ?? true,
        },
      });
    }
  } catch (err) {
    strapi.log.error('[Portfolio Seed] Error configuring Page Builder templates:', err);
  }
}

export async function ensurePortfolioSeeded(strapi: any, force = false) {
  try {
    // 1. Ensure public permissions for all content types + Page Builder templates
    const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
      where: { type: 'public' },
    });

    if (publicRole) {
      const permissionActions = [
        'api::global.global.find',
        'api::landing-page.landing-page.find',
        'api::page.page.find',
        'api::page.page.findOne',
        'api::project.project.find',
        'api::project.project.findOne',
        'api::experience.experience.find',
        'api::experience.experience.findOne',
        'plugin::page-builder.template.find',
        'plugin::page-builder.template.findOne',
      ];

      for (const action of permissionActions) {
        const existingPerm = await strapi.db
          .query('plugin::users-permissions.permission')
          .findOne({
            where: {
              action,
              role: publicRole.id,
            },
          });

        if (!existingPerm) {
          await strapi.db.query('plugin::users-permissions.permission').create({
            data: {
              action,
              role: publicRole.id,
            },
          });
        }
      }
    }

    // Locate legacy JSON content directory at ../src/content
    const legacyContentDir = path.resolve(process.cwd(), '..', 'src', 'content');
    const profilePath = path.join(legacyContentDir, 'profile', 'index.json');
    const profile = fs.existsSync(profilePath)
      ? JSON.parse(fs.readFileSync(profilePath, 'utf-8'))
      : {
          name: 'Matteo Louis Casling',
          tagline: 'Senior Multimedia Producer, 3D Motion Designer & UN Communications Strategist',
          location: 'New York, NY / Rome, Italy',
          email: 'matteocasling@gmail.com',
          phone: '+39 327 662 4932',
          softwareMeters: [],
          metrics: [],
        };

    // Check if core collections are already seeded (unless force = true)
    const existingLanding = await strapi.documents('api::landing-page.landing-page').findFirst({
      status: 'published',
    });

    const existingProjects = await strapi.documents('api::project.project').findMany({
      status: 'published',
    });

    if (!force && existingLanding && existingProjects && existingProjects.length > 0) {
      // Even when already seeded, ensure Page Builder templates & relations are initialized
      await ensurePageBuilderTemplatesAndSettings(strapi, profile, existingLanding, false);
      strapi.log.info(
        `[Portfolio Seed] Database already seeded (${existingProjects.length} projects) and Page Builder templates verified.`
      );
      return;
    }

    strapi.log.info('[Portfolio Seed] Seeding Matteo Louis Casling Portfolio into Strapi v5...');

    if (force) {
      const oldProjects = await strapi.documents('api::project.project').findMany({});
      for (const p of oldProjects) {
        await strapi.documents('api::project.project').delete({ documentId: p.documentId });
      }
      const oldExps = await strapi.documents('api::experience.experience').findMany({});
      for (const e of oldExps) {
        await strapi.documents('api::experience.experience').delete({ documentId: e.documentId });
      }
    }

    // 2. Seed Projects Collection
    const projectsDir = path.join(legacyContentDir, 'projects');
    const createdProjects: any[] = [];

    if (fs.existsSync(projectsDir)) {
      const projectFiles = fs.readdirSync(projectsDir).filter((f) => f.endsWith('.json'));
      const rawProjects = projectFiles
        .map((file) => {
          const slug = file.replace(/\.json$/, '');
          const data = JSON.parse(fs.readFileSync(path.join(projectsDir, file), 'utf-8'));
          return { slug, ...data };
        })
        .sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99));

      for (const proj of rawProjects) {
        const existing = await strapi.documents('api::project.project').findMany({
          filters: { slug: proj.slug },
        });
        for (const item of existing) {
          await strapi.documents('api::project.project').delete({ documentId: item.documentId });
        }

        const created = await strapi.documents('api::project.project').create({
          data: {
            title: proj.title,
            slug: proj.slug,
            chapterNumber: proj.chapterNumber || '01',
            category: proj.category || 'video',
            madeFor: proj.madeFor || '',
            year: proj.year || '2024',
            location: proj.location || '',
            track: proj.track || 'both',
            featuredInReel: Boolean(proj.featuredInReel),
            sortOrder: proj.sortOrder ?? 1,
            shortDescription: proj.shortDescription || '',
            mandateChallenge: proj.mandateChallenge || '',
            executionCraft: proj.executionCraft || '',
            impactMetric: proj.impactMetric || '',
            thumbnail: proj.thumbnail || '',
            secondaryImage: proj.secondaryImage || '',
            videoYoutubeId: proj.videoYoutubeId || '',
            externalUrl: proj.externalUrl || '',
            externalLabel: proj.externalLabel || 'View Project',
            tools: Array.isArray(proj.tools)
              ? proj.tools.map((t: string) => ({ name: t }))
              : [],
          },
          status: 'published',
        });
        createdProjects.push(created);
      }
    }

    // 3. Seed Experiences Collection
    const experiencesDir = path.join(legacyContentDir, 'experiences');
    const createdExperiences: any[] = [];

    if (fs.existsSync(experiencesDir)) {
      const expFiles = fs.readdirSync(experiencesDir).filter((f) => f.endsWith('.json'));
      const rawExps = expFiles
        .map((file) => {
          const slug = file.replace(/\.json$/, '');
          const data = JSON.parse(fs.readFileSync(path.join(experiencesDir, file), 'utf-8'));
          return { slug, ...data };
        })
        .sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99));

      for (const exp of rawExps) {
        const slug = exp.roleSlug || exp.slug;
        const existing = await strapi.documents('api::experience.experience').findMany({
          filters: { slug },
        });
        for (const item of existing) {
          await strapi.documents('api::experience.experience').delete({ documentId: item.documentId });
        }

        const cleanLogoPath =
          exp.logoPath === '/assets/logos/iaea-fao-white.png'
            ? '/assets/logos/iaea-fao-navy.png'
            : (exp.logoPath || '').replace('-white.png', '.png');

        const created = await strapi.documents('api::experience.experience').create({
          data: {
            roleTitle: exp.roleTitle,
            slug,
            organization: exp.organization || '',
            organizationShort: exp.organizationShort || '',
            location: exp.location || '',
            period: exp.period || '',
            sortOrder: exp.sortOrder ?? 1,
            logoPath: cleanLogoPath,
            trackHighlight: exp.trackHighlight || '',
            highlights: Array.isArray(exp.highlights)
              ? exp.highlights.map((b: string) => ({ text: b }))
              : [],
          },
          status: 'published',
        });
        createdExperiences.push(created);
      }
    }

    // 4. Seed Global Single Type (Header, Footer, 3D Rig Settings)
    const existingGlobal = await strapi.documents('api::global.global').findFirst({});
    if (existingGlobal) {
      await strapi.documents('api::global.global').delete({ documentId: existingGlobal.documentId });
    }

    await strapi.documents('api::global.global').create({
      data: {
        title: `${profile.name} - Multimedia Producer, 3D Motion Designer & UN Communications Specialist`,
        description:
          'Portfolio of Matteo Louis Casling: Senior Multimedia Producer, 3D/Motion Systems Designer (Blender, Unreal Engine 5, After Effects), and Strategic Communications Specialist (UN DESA, IAEA, FAO, IFAD, PBS News).',
        header: {
          monogram: 'MC',
          fullName: profile.name,
          navItems: [
            { label: 'Education & Skills', href: '#education-skills', isExternal: false, isButtonLink: false, type: 'GHOST' },
            { label: '3D & Motion Reel', href: '#showreel', isExternal: false, isButtonLink: false, type: 'GHOST' },
            { label: 'Work Samples', href: '#work', isExternal: false, isButtonLink: false, type: 'GHOST' },
            { label: 'Work Experience', href: '#experience', isExternal: false, isButtonLink: false, type: 'GHOST' },
            { label: 'CV & Dossier', href: '#documents', isExternal: false, isButtonLink: false, type: 'GHOST' },
          ],
          cmsCta: {
            label: 'Strapi CMS',
            href: 'http://localhost:1337/admin',
            isExternal: true,
            isButtonLink: true,
            type: 'SECONDARY',
          },
          primaryCta: {
            label: 'Send Email',
            href: `mailto:${profile.email}`,
            isExternal: false,
            isButtonLink: true,
            type: 'PRIMARY',
          },
        },
        footer: {
          copyrightName: profile.name,
          links: [
            { label: 'Back to Top', href: '#top', isExternal: false, isButtonLink: false, type: 'GHOST' },
            { label: 'Strapi Admin Panel', href: 'http://localhost:1337/admin', isExternal: true, isButtonLink: false, type: 'GHOST' },
            { label: 'REST API (/api/landing-page)', href: 'http://localhost:1337/api/landing-page', isExternal: true, isButtonLink: false, type: 'GHOST' },
          ],
        },
        studio3d: {
          engineMode: 'procedural-sculpture',
          splineUrl: '',
          glbPath: '',
          deepNavyHex: '#172a3b',
          cobaltHex: '#304774',
          iceBlueHex: '#d9ebf4',
          coralAccentHex: '#f29f8b',
          scrollMorphIntensity: 1.15,
          cameraRigScale: 1.15,
          videoLightIntensity: 3.0,
          videoLightColor: '#d9ebf4',
          strataSpread: 1.15,
          sceneOffsetX: 2.55,
          sceneOffsetY: -0.1,
          showTopographicContours: true,
        },
      },
      status: 'published',
    });

    // 5. Seed Landing Page Single Type with Modular Dynamic Zone Blocks
    const oldLanding = await strapi.documents('api::landing-page.landing-page').findFirst({});
    if (oldLanding) {
      await strapi.documents('api::landing-page.landing-page').delete({ documentId: oldLanding.documentId });
    }

    const createdLanding = await strapi.documents('api::landing-page.landing-page').create({
      data: {
        title: `${profile.name} - Portfolio & 3D Motion Studio`,
        description:
          'Six years translating global policy, development finance, and climate science into documentary cinema, Blender 3D animations, and Drupal 10 platforms.',
        blocks: [
          {
            __component: 'blocks.hero-stratum',
            taglineBadge: profile.tagline,
            fullName: profile.name,
            quoteText:
              'Six years translating global policy, development finance, and climate science into documentary cinema, Blender 3D animations, and Drupal 10 platforms.',
            portraitImageUrl: '/assets/matteo-portrait-cutout.webp',
            primaryCta: {
              label: 'Explore Work',
              href: '#work',
              isExternal: false,
              isButtonLink: true,
              type: 'PRIMARY',
            },
            secondaryCta: {
              label: 'Download Styled CV',
              href: '/documents/Matteo_Casling_CV.pdf',
              isExternal: true,
              isButtonLink: true,
              type: 'SECONDARY',
            },
            floatingArtifactTitle: '3D & Motion Layers',
            floatingArtifactSubtitle: 'Blender + Three.js + GSAP',
            floatingArtifactHref: '#chapter-02',
            floatingArtifactImageUrl: '/assets/projects/locust-3d-sculpture.png',
          },
          {
            __component: 'blocks.logo-wall',
            ariaLabel: 'United Nations Agencies and Broadcast Partners',
            logos: [
              {
                name: 'UN DESA',
                alt: 'United Nations Department of Economic and Social Affairs (UN DESA)',
                imageUrl: '/assets/logos/un-desa.png',
                darkBg: false,
              },
              {
                name: 'FAO / IAEA',
                alt: 'Joint FAO/IAEA Centre of Nuclear Techniques in Food and Agriculture',
                imageUrl: '/assets/logos/iaea-fao-navy.png',
                darkBg: false,
              },
              {
                name: 'FAO',
                alt: 'Food and Agriculture Organization of the United Nations (FAO)',
                imageUrl: '/assets/logos/fao.png',
                darkBg: false,
              },
              {
                name: 'IFAD',
                alt: 'International Fund for Agricultural Development (IFAD)',
                imageUrl: '/assets/logos/ifad.png',
                darkBg: false,
              },
              {
                name: 'CIME',
                alt: 'Italian Council of the European Movement (CIME)',
                imageUrl: '/assets/logos/cime.png',
                darkBg: false,
              },
              {
                name: 'PBS News',
                alt: 'PBS News',
                imageUrl: '/assets/logos/pbs.png',
                darkBg: false,
              },
              {
                name: 'John Cabot University',
                alt: 'John Cabot University',
                imageUrl: '/assets/logos/jcu.png',
                darkBg: false,
              },
            ],
          },
          {
            __component: 'blocks.education-skills-stratum',
            sectionId: 'education-skills',
            metrics: (profile.metrics || []).map((m: any, idx: number) => ({
              value: m.value,
              label: m.label,
              agency: m.agency,
              theme: idx % 2 === 0 ? 'paper' : 'cobalt',
            })),
            educationHeading: 'Education',
            educationItems: [
              {
                degree: 'MA Marketing, Buying Behaviour and Digital Communication',
                school: 'John Cabot University',
                years: '2019-2020',
              },
              {
                degree: 'Bachelor of Arts in Communications',
                school: 'John Cabot University',
                years: '2014-2017',
              },
              {
                degree: 'Diploma Scuola Superiore - Graphic Design',
                school: 'Liceo Artistico Via di Ripetta, Rome',
                years: '2008-2013',
              },
            ],
            skillsHeading: 'Skills & 3D Pipeline',
            softwareMeters: (profile.softwareMeters || []).map((sw: any) => ({
              name: sw.name,
              subtitle: sw.subtitle,
              segmentsFilled: sw.segmentsFilled ?? 8,
            })),
          },
          {
            __component: 'blocks.horizontal-showreel',
            sectionId: 'showreel',
            eyebrow: 'GSAP ScrollTrigger Horizontal Cinema',
            heading: '3D & Motion Showreel',
            subHeading:
              'Scroll to scrub through selected UN documentary films, Blender 3D scientific visualizations, and motion graphics.',
            onlyFeatured: true,
          },
          {
            __component: 'blocks.portfolio-chapters',
            sectionId: 'work',
            eyebrow: 'Curated Un-Portfolio Index (Chapters 01 - 05)',
            heading: 'Work Samples & Production Archive',
            subHeading:
              "Filter by audience focus or jump directly across the five chapters of Matteo's portfolio.",
            defaultTrackFilter: 'all',
            chapters: [
              {
                chapterNumber: '01',
                title: 'Videos & Documentary Cinema',
                subtitle: 'COP28 Dubai, UN DESA Dominican Republic, and FAO Desert Locust field documentaries',
              },
              {
                chapterNumber: '02',
                title: 'Animations & 3D Visualization',
                subtitle: 'Blender 3D biological & nuclear mechanics, After Effects motion systems, and IFAD evaluations',
              },
              {
                chapterNumber: '03',
                title: 'Editorial & Publication Design',
                subtitle: 'Multilingual UN flagship reports, COP28 technical brochures, and SOP field manuals',
              },
              {
                chapterNumber: '04',
                title: 'Websites & Digital Platforms',
                subtitle: 'Drupal 10 & WordPress full-stack institutional architectures for UN DESA FINS',
              },
              {
                chapterNumber: '05',
                title: 'Articles, Stories & Podcasts',
                subtitle: 'World Water Day global photo essays and IFAD Roots podcasts from Nepal & Sierra Leone',
              },
            ],
          },
          {
            __component: 'blocks.experience-cascade',
            sectionId: 'experience',
            heading: 'Work Experience',
            subHeading:
              'Six years of end-to-end multimedia production, location directing, 3D animation, and Drupal/WordPress web architecture across United Nations agencies and broadcast news.',
          },
          {
            __component: 'blocks.dossier-contact',
            sectionId: 'documents',
            heading: 'CV Dossiers & Strapi Headless CMS',
            description:
              "Download Matteo's original topographic PDF CVs and 13-page portfolio book, or launch the Strapi v5 Admin Panel to manage page blocks, projects, career milestones, and 3D topographic scenes visually.",
            dossierCards: [
              {
                title: 'UN & Policy CV',
                subtitle: 'Styled Topographic PDF',
                href: '/documents/Matteo_Casling_CV.pdf',
                iconType: 'pdf',
              },
              {
                title: 'Motion & Tech CV',
                subtitle: 'Video / 3D / Code PDF',
                href: '/documents/Matteo_Casling_CV_Tech_Motion.pdf',
                iconType: 'film',
              },
              {
                title: 'Un-Portfolio Book',
                subtitle: '13-Page Editorial PDF',
                href: '/documents/Matteo_Casling_Portfolio_Book.pdf',
                iconType: 'browser',
              },
            ],
            contactHeading: 'Direct Contact',
            email: profile.email,
            phone: profile.phone,
            location: profile.location,
            cmsLabel: 'Strapi v5 Admin',
            cmsUrl: 'http://localhost:1337/admin',
            primaryCta: {
              label: 'Send Email',
              href: `mailto:${profile.email}`,
              isExternal: false,
              isButtonLink: true,
              type: 'PRIMARY',
            },
            secondaryCta: {
              label: 'Open Strapi CMS',
              href: 'http://localhost:1337/admin',
              isExternal: true,
              isButtonLink: true,
              type: 'SECONDARY',
            },
          },
        ],
      },
      status: 'published',
    });

    // 6. Seed Page Builder Templates & Link Landing Page Template
    await ensurePageBuilderTemplatesAndSettings(strapi, profile, createdLanding, force);

    strapi.log.info(
      `[Portfolio Seed] Successfully seeded Global, Landing Page, Page Builder Templates, ${createdProjects.length} Projects, and ${createdExperiences.length} Experiences!`
    );
  } catch (err) {
    strapi.log.error('[Portfolio Seed] Error during auto-seed:', err);
  }
}
