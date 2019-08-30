import {
  getContractAddresses,
  getOptions,
  getWeb3,
  sendQuery,
  writeProposalIPFS,
} from './util';

const ContributionReward = require('@daostack/arc/build/contracts/ContributionReward.json');
const Avatar = require('@daostack/arc/build/contracts/Avatar.json');
describe('Domain Layer', () => {
  let web3;
  let addresses;
  let opts;

  beforeAll(async () => {
    web3 = await getWeb3();
    addresses = getContractAddresses();
    opts = await getOptions(web3);
  });

  it('Sanity', async () => {
    const accounts = web3.eth.accounts.wallet;

    const contributionReward = new web3.eth.Contract(
      ContributionReward.abi,
      addresses.ContributionReward,
      opts,
    );

    // Full valid data on IPFS

    let proposalIPFSData = {
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\nWhat is Lorem Ipsum?\nFrom its medieval origins to the digital era, learn everything there is to know about the ubiquitous lorem ipsum passage.\n\nLorem ipsum used in a magazine layout\nMAGAZINE LAYOUT WITH LOREM IPSUM\nHISTORY, PURPOSE AND USAGE\nLorem ipsum, or lipsum as it is sometimes known, is dummy text used in laying out print, graphic or web designs. The passage is attributed to an unknown typesetter in the 15th century who is thought to have scrambled parts of Cicero\'s De Finibus Bonorum et Malorum for use in a type specimen book. It usually begins with:\n\n“Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.”\nThe purpose of lorem ipsum is to create a natural looking block of text (sentence, paragraph, page, etc.) that doesn\'t distract from the layout. A practice not without controversy, laying out pages with meaningless filler text can be very useful when the focus is meant to be on design, not content.\n\nThe passage experienced a surge in popularity during the 1960s when Letraset used it on their dry-transfer sheets, and again during the 90s as desktop publishers bundled the text with their software. Today it\'s seen all around the web; on templates, websites, and stock designs. Use our generator to get your own, or read on for the authoritative history of lorem ipsum.\n\nOrigins and Discovery\nLorem ipsum began as scrambled, nonsensical Latin derived from Cicero\'s 1st-century BC text De Finibus Bonorum et Malorum.\n\nEngraving of Marcus Tullius Cicero\nCICERO\nHEDONIST ROOTS\nUntil recently, the prevailing view assumed lorem ipsum was born as a nonsense text. “It\'s not Latin, though it looks like it, and it actually says nothing,” Before & After magazine answered a curious reader, “Its ‘words’ loosely approximate the frequency with which letters occur in English, which is why at a glance it looks pretty real.”\n\nAs Cicero would put it, “Um, not so fast.”\n\nThe placeholder text, beginning with the line “Lorem ipsum dolor sit amet, consectetur adipiscing elit”, looks like Latin because in its youth, centuries ago, it was Latin.\n\nRichard McClintock, a Latin scholar from Hampden-Sydney College, is credited with discovering the source behind the ubiquitous filler text. In seeing a sample of lorem ipsum, his interest was piqued by consectetur—a genuine, albeit rare, Latin word. Consulting a Latin dictionary led McClintock to a passage from De Finibus Bonorum et Malorum (“On the Extremes of Good and Evil”), a first-century B.C. text from the Roman philosopher Cicero.\n\nIn particular, the garbled words of lorem ipsum bear an unmistakable resemblance to sections 1.10.32–33 of Cicero\'s work, with the most notable passage excerpted below:\n\n“Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.”\nA 1914 English translation by Harris Rackham reads:\n\n“Nor is there anyone who loves or pursues or desires to obtain pain of itself, because it is pain, but occasionally circumstances occur in which toil and pain can procure him some great pleasure.”\nMcClintock\'s eye for detail certainly helped narrow the whereabouts of lorem ipsum\'s origin, however, the “how and when” still remain something of a mystery, with competing theories and timelines.\n\nFuzzy Beginnings\nCreation timelines for the standard lorem ipsum passage vary, with some citing the 15th century and others the 20th.\n\nTypesetter selecting type for a galley\nTYPESETTER SELECTING TYPE\nREMIXING A CLASSIC\nSo how did the classical Latin become so incoherent? According to McClintock, a 15th century typesetter likely scrambled part of Cicero\'s De Finibus in order to provide placeholder text to mockup various fonts for a type specimen book.\n\nIt\'s difficult to find examples of lorem ipsum in use before Letraset made it popular as a dummy text in the 1960s, although McClintock says he remembers coming across the lorem ipsum passage in a book of old metal type samples. So far he hasn\'t relocated where he once saw the passage, but the popularity of Cicero in the 15th century supports the theory that the filler text has been used for centuries.\n\nAnd anyways, as Cecil Adams reasoned, “[Do you really] think graphic arts supply houses were hiring classics scholars in the 1960s?” Perhaps. But it seems reasonable to imagine that there was a version in use far before the age of Letraset.\n\nMcClintock wrote to Before & After to explain his discovery;\n\n“What I find remarkable is that this text has been the industry\'s standard dummy text ever since some printer in the 1500s took a galley of type and scrambled it to make a type specimen book; it has survived not only four centuries of letter-by-letter resetting but even the leap into electronic typesetting, essentially unchanged except for an occasional \'ing\' or \'y\' thrown in. It\'s ironic that when the then-understood Latin was scrambled, it became as incomprehensible as Greek; the phrase \'it\'s Greek to me\' and \'greeking\' have common semantic roots!” (The editors published his letter in a correction headlined “Lorem Oopsum”).\nAs an alternative theory, (and because Latin scholars do this sort of thing) someone tracked down a 1914 Latin edition of De Finibus which challenges McClintock\'s 15th century claims and suggests that the dawn of lorem ipsum was as recent as the 20th century. The 1914 Loeb Classical Library Edition ran out of room on page 34 for the Latin phrase “dolorem ipsum” (sorrow in itself). Thus, the truncated phrase leaves one page dangling with “do-”, while another begins with the now ubiquitous “lorem ipsum”.\n\nWhether a medieval typesetter chose to garble a well-known (but non-Biblical—that would have been sacrilegious) text, or whether a quirk in the 1914 Loeb Edition inspired a graphic designer, it\'s admittedly an odd way for Cicero to sail into the 21st century.\n\nMeaning of Lorem Ipsum\nLorem ipsum was purposefully designed to have no meaning, but appear like real text, making it the perfect placeholder.\n\nLetraset Transfer Sheets with Lorem Ipsum\nLETRASET TRANSFER SHEETS\nINTERPRETING NONSENSE\nDon\'t bother typing “lorem ipsum” into Google translate. If you already tried, you may have gotten anything from "NATO" to "China", depending on how you capitalized the letters. The bizarre translation was fodder for conspiracy theories, but Google has since updated its “lorem ipsum” translation to, boringly enough, “lorem ipsum”.\n\nOne brave soul did take a stab at translating the almost-not-quite-Latin. According to The Guardian, Jaspreet Singh Boparai undertook the challenge with the goal of making the text “precisely as incoherent in English as it is in Latin - and to make it incoherent in the same way”. As a result, “the Greek \'eu\' in Latin became the French \'bien\' [...] and the \'-ing\' ending in \'lorem ipsum\' seemed best rendered by an \'-iendum\' in English.”\n\nHere is the classic lorem ipsum passage followed by Boparai\'s odd, yet mesmerizing version:\n\n“Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam hendrerit nisi sed sollicitudin pellentesque. Nunc posuere purus rhoncus pulvinar aliquam. Ut aliquet tristique nisl vitae volutpat. Nulla aliquet porttitor venenatis. Donec a dui et dui fringilla consectetur id nec massa. Aliquam erat volutpat. Sed ut dui ut lacus dictum fermentum vel tincidunt neque. Sed sed lacinia lectus. Duis sit amet sodales felis. Duis nunc eros, mattis at dui ac, convallis semper risus. In adipiscing ultrices tellus, in suscipit massa vehicula eu.”\nBoparai\'s version:\n\n“Rrow itself, let it be sorrow; let him love it; let him pursue it, ishing for its acquisitiendum. Because he will ab hold, uniess but through concer, and also of those who resist. Now a pure snore disturbeded sum dust. He ejjnoyes, in order that somewon, also with a severe one, unless of life. May a cusstums offficer somewon nothing of a poison-filled. Until, from a twho, twho chaffinch may also pursue it, not even a lump. But as twho, as a tank; a proverb, yeast; or else they tinscribe nor. Yet yet dewlap bed. Twho may be, let him love fellows of a polecat. Now amour, the, twhose being, drunk, yet twhitch and, an enclosed valley’s always a laugh. In acquisitiendum the Furies are Earth; in (he takes up) a lump vehicles bien.”\nNick Richardson described the translation “like extreme Mallarmé, or a Burroughsian cut-up, or a paragraph of Finnegans Wake. Bits of it have surprising power: the desperate insistence on loving and pursuing sorrow, for instance, that is cheated out of its justification – an incomplete object that has been either fished for, or wished for.”\n\nUsage and Examples\nLorem ipsum was popularized in the 1960s with Letraset\'s dry-transfer sheets, and later entered the digital world via Aldus PageMaker.\n\nLorem Ipsum in Word Processing Software\nWORD PROCESSING SOFTWARE\nDIGITAL IPSUM\nThe decade that brought us Star Trek and Doctor Who also resurrected Cicero—or at least what used to be Cicero—in an attempt to make the days before computerized design a little less painstaking.\n\nThe French lettering company Letraset manufactured a set of dry-transfer sheets which included the lorem ipsum filler text in a variety of fonts, sizes, and layouts. These sheets of lettering could be rubbed on anywhere and were quickly adopted by graphic artists, printers, architects, and advertisers for their professional look and ease of use.\n\nAldus Corporation, which later merged with Adobe Systems, ushered lorem ipsum into the information age with its desktop publishing software Aldus PageMaker. The program came bundled with lorem ipsum dummy text for laying out page content, and other word processors like Microsoft Word followed suit. More recently the growth of web design has helped proliferate lorem ipsum across the internet as a placeholder for future text—and in some cases the final content (this is why we proofread, kids).\n\nControversy in the Design World\nSome claim lorem ipsum threatens to promote design over content, while others defend its value in the process of planning.\n\nStar Wars lorem ipsum\nSTAR WARS LOREM IPSUM\nDESIGN OR (DIS)CONTENT\nAmong design professionals, there\'s a bit of controversy surrounding the filler text. Controversy, as in Death to Lorem Ipsum.\n\nThe strength of lorem ipsum is its weakness: it doesn\'t communicate. To some, designing a website around placeholder text is unacceptable, akin to sewing a custom suit without taking measurements. Kristina Halvorson notes:\n\n“I’ve heard the argument that “lorem ipsum” is effective in wireframing or design because it helps people focus on the actual layout, or color scheme, or whatever. What kills me here is that we’re talking about creating a user experience that will (whether we like it or not) be DRIVEN by words. The entire structure of the page or app flow is FOR THE WORDS.”\nLorem ipsum is so ubiquitous because it is so versatile. Select how many paragraphs you want, copy, paste, and break the lines wherever it is convenient. Real copy doesn\'t work that way.\n\nAs front-end developer Kyle Fiedler put it:\n\n“When you are designing with Lorem Ipsum, you diminish the importance of the copy by lowering it to the same level as any other visual element. The text simply becomes another supporting role, serving to make other aspects more aesthetic. Instead of your design enhancing the meaning of the content, your content is enhancing your design.”\nBut despite zealous cries for the demise of lorem ipsum, others, such as Karen McGrane, offer appeals for moderation:\n\n“Lorem Ipsum doesn’t exist because people think the content is meaningless window dressing, only there to be decorated by designers who can’t be bothered to read. Lorem Ipsum exists because words are powerful. If you fill up your page with draft copy about your client’s business, they will read it. They will comment on it. They will be inexorably drawn to it. Presented the wrong way, draft copy can send your design review off the rails.”\nAnd that’s why a 15th century typesetter might have scrambled a passage of Cicero; he wanted people to focus on his fonts, to imagine their own content on the pages. He wanted people to see, and to get them to see he had to keep them from reading.\n\nWhen to Use Lorem Ipsum\nGenerally, lorem ipsum is best suited to keeping templates from looking bare or minimizing the distractions of draft copy.\n\nStar Wars lorem ipsum\nLOREM IPSUM WEBSITE\nFORM OVER FUNCTION\nSo when is it okay to use lorem ipsum? First, lorem ipsum works well for staging. It\'s like the props in a furniture store—filler text makes it look like someone is home. The same Wordpress template might eventually be home to a fitness blog, a photography website, or the online journal of a cupcake fanatic. Lorem ipsum helps them imagine what the lived-in website might look like.\n\nSecond, use lorem ipsum if you think the placeholder text will be too distracting. For specific projects, collaboration between copywriters and designers may be best, however, like Karen McGrane said, draft copy has a way of turning any meeting about layout decisions into a discussion about word choice. So don\'t be afraid to use lorem ipsum to keep everyone focused.\n\nOne word of caution: make sure your client knows that lorem ipsum is filler text. You don\'t want them wondering why you filled their website with a foreign language, and you certainly don\'t want anyone prematurely publishing it.\n\nLorem Ipsum All the Things\nComing full circle, the internet\'s remixing of the now infamous lorem ipsum passage has officially elevated it to pop culture status.\n\nBacon Ipsum Generator\nBACON IPSUM GENERATOR\nBECAUSE IT\'S THE INTERNET\nThere was that time artists at Sequence opted to hand-Sharpie the lorem ipsum passage on a line of paper bags they designed for Chipotle—the result being a mixture of avant-garde, inside joke, and Sharpie-stained tables. Those with an eye for detail may have caught a tribute to the classic text in an episode of Mad Men (S6E1 around 1:18:55 for anyone that didn\'t). And here is a lorem ipsum tattoo.\n\nOf course, we\'d be remiss not to include the veritable cadre of lorem ipsum knock offs featuring:\n\nBacon Ipsum – Served all day. “Bacon ipsum dolor amet chicken turducken spare ribs.”\n\nHipster Ipsum – In case you\'re in need of a “shoreditch direct trade four dollar toast copper mug.”\n\nCorporate Ipsum – “Leveraging agile frameworks to provide a robust synopsis” from eight to five.\n\nLegal Ipsum – Fully unlicensed legalese for those times you don\'t want to pay $400/hr.\n\nNot to mention, Cupcake Ipsum, Bob Ross Ipsum (“happy little clouds”), and the furry Cat Ipsum. And in case that\'s not enough, check out our very own Ultimate List of Lorem Ipsum Generators.\n\nSo there you have it. Lorem ipsum: the nonsense words unable to fully escape meaning.\n\nOriginal Source Text\nBelow are the original Latin passages from which Lorem Ipsum was derived, paired with their 1914 translations by H. Rackham.\n\nCicero\'s De finibus bonorum et malorum\nCICERO\'S DE FINIBUS OPENING PAGE\nSECTION 1.10.32 OF CICERO\'S “DE FINIBUS BONORUM ET MALORUM”\nOriginal Latin text:\n\n“Sed ut perspiciatis, unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam eaque ipsa, quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt, explicabo. Nemo enim ipsam voluptatem, quia voluptas sit, aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos, qui ratione voluptatem sequi nesciunt, neque porro quisquam est, qui dolorem ipsum, quia dolor sit amet consectetur adipisci[ng] velit, sed quia non numquam [do] eius modi tempora inci[di]dunt, ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit, qui in ea voluptate velit esse, quam nihil molestiae consequatur, vel illum, qui dolorem eum fugiat, quo voluptas nulla pariatur?”\nTranslation by H. Rackham:\n\n“But I must explain to you how all this mistaken idea of denouncing of a pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness. No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know how to pursue pleasure rationally encounter consequences that are extremely painful. Nor again is there anyone who loves or pursues or desires to obtain pain of itself, because it is pain, but occasionally circumstances occur in which toil and pain can procure him some great pleasure. To take a trivial example, which of us ever undertakes laborious physical exercise, except to obtain some advantage from it? But who has any right to find fault with a man who chooses to enjoy a pleasure that has no annoying consequences, or one who avoids a pain that produces no resultant pleasure?”\nSECTION 1.10.33 OF CICERO\'S “DE FINIBUS BONORUM ET MALORUM”\nOriginal Latin text:\n\n“At vero eos et accusamus et iusto odio dignissimos ducimus, qui blanditiis praesentium voluptatum deleniti atque corrupti, quos dolores et quas molestias excepturi sint, obcaecati cupiditate non provident, similique sunt in culpa, qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio, cumque nihil impedit, quo minus id, quod maxime placeat, facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet, ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat…”\nTranslation by H. Rackham:\n\n“On the other hand, we denounce with righteous indignation and dislike men who are so beguiled and demoralized by the charms of pleasure of the moment, so blinded by desire, that they cannot foresee the pain and trouble that are bound to ensue; and equal blame belongs to those who fail in their duty through weakness of will, which is the same as saying through shrinking from toil and pain. These cases are perfectly simple and easy to distinguish. In a free hour, when our power of choice is untrammeled and when nothing prevents our being able to do what we like best, every pleasure is to be welcomed and every pain avoided. But in certain circumstances and owing to the claims of duty or the obligations of business it will frequently occur that pleasures have to be repudiated and annoyances accepted. The wise man therefore always holds in these matters to this principle of selection: he rejects pleasures to secure other greater pleasures, or else he endures pains to avoid worse pains.',
      title: 'My Title!',
      url: 'http://swift.org/modest',
    };

    let proposalDescription = proposalIPFSData.description;
    let proposalTitle = proposalIPFSData.title;
    let proposalUrl = proposalIPFSData.url;

    let descHash = await writeProposalIPFS(proposalIPFSData);

    async function propose({
      proposalDescHash,
      rep,
      tokens,
      eth,
      external,
      periodLength,
      periods,
      beneficiary,
    }) {
      const prop = contributionReward.methods.proposeContributionReward(
        addresses.Avatar,
        proposalDescHash,
        rep,
        [tokens, eth, external, periodLength, periods],
        addresses.GEN,
        beneficiary,
      );
      const proposalId = await prop.call();
      const { blockNumber } = await prop.send();
      const { timestamp } = await web3.eth.getBlock(blockNumber);

      return { proposalId, timestamp };
    }

    const { proposalId: p1 } = await propose({
      proposalDescHash: descHash,
      rep: 10,
      tokens: 10,
      eth: 10,
      external: 10,
      periodLength: 0,
      periods: 1,
      beneficiary: accounts[1].address,
    });

    let getProposal = `{
        proposal(id: "${p1}") {
            id
            descriptionHash
            title
            description
            url
        }
    }`;

    let proposal = (await sendQuery(getProposal)).proposal;
    expect(proposal).toMatchObject({
      id: p1,
      descriptionHash: descHash,
      title: proposalTitle,
      description: proposalDescription,
      url: proposalUrl,
    });

    // Partial data on IPFS
    let proposalIPFSData2 = {
      title: 'New Title!',
      url: 'http://swift.org/modest2',
    };

    proposalTitle = proposalIPFSData2.title;
    proposalUrl = proposalIPFSData2.url;

    descHash = await writeProposalIPFS(proposalIPFSData2);

    const { proposalId: p2 } = await propose({
      proposalDescHash: descHash,
      rep: 10,
      tokens: 10,
      eth: 10,
      external: 10,
      periodLength: 0,
      periods: 1,
      beneficiary: accounts[1].address,
    });

    getProposal = `{
        proposal(id: "${p2}") {
            id
            descriptionHash
            title
            description
            url
        }
    }`;

    proposal = (await sendQuery(getProposal)).proposal;
    expect(proposal).toMatchObject({
      id: p2,
      descriptionHash: descHash,
      title: proposalTitle,
      description: null,
      url: proposalUrl,
    });

    // Empty JSON on IPFS
    let proposalIPFSData3 = {};

    descHash = await writeProposalIPFS(proposalIPFSData3);

    const { proposalId: p3 } = await propose({
      proposalDescHash: descHash,
      rep: 10,
      tokens: 10,
      eth: 10,
      external: 10,
      periodLength: 0,
      periods: 1,
      beneficiary: accounts[1].address,
    });

    getProposal = `{
        proposal(id: "${p3}") {
            id
            descriptionHash
            title
            description
            url
        }
    }`;

    proposal = (await sendQuery(getProposal)).proposal;
    expect(proposal).toMatchObject({
      id: p3,
      descriptionHash: descHash,
      title: '',
      description: null,
      url: null,
    });

    // Invalid IPFS hash
    descHash = 'invalid ipfs hash!';

    const { proposalId: p4 } = await propose({
      proposalDescHash: descHash,
      rep: 10,
      tokens: 10,
      eth: 10,
      external: 10,
      periodLength: 0,
      periods: 1,
      beneficiary: accounts[1].address,
    });

    getProposal = `{
        proposal(id: "${p4}") {
            id
            descriptionHash
            title
            description
            url
        }
    }`;

    proposal = (await sendQuery(getProposal)).proposal;
    expect(proposal).toMatchObject({
      id: p4,
      descriptionHash: descHash,
      title: '',
      description: null,
      url: null,
    });

    // Invalid IPFS data1
    let invalidIPFSData1 = 'invalid ipfs data!';

    descHash = await writeProposalIPFS(invalidIPFSData1);

    const { proposalId: p5 } = await propose({
      proposalDescHash: descHash,
      rep: 10,
      tokens: 10,
      eth: 10,
      external: 10,
      periodLength: 0,
      periods: 1,
      beneficiary: accounts[1].address,
    });

    getProposal = `{
        proposal(id: "${p5}") {
            id
            descriptionHash
            title
            description
            url
        }
    }`;

    proposal = (await sendQuery(getProposal)).proposal;
    expect(proposal).toMatchObject({
      id: p5,
      descriptionHash: descHash,
      title: '',
      description: null,
      url: null,
    });

    // Invalid IPFS data2
    let invalidIPFSData2 = '{ invalid ipfs data! }';

    descHash = await writeProposalIPFS(invalidIPFSData2);

    const { proposalId: p6 } = await propose({
      proposalDescHash: descHash,
      rep: 10,
      tokens: 10,
      eth: 10,
      external: 10,
      periodLength: 0,
      periods: 1,
      beneficiary: accounts[1].address,
    });

    getProposal = `{
        proposal(id: "${p6}") {
            id
            descriptionHash
            title
            description
            url
        }
    }`;

    proposal = (await sendQuery(getProposal)).proposal;
    expect(proposal).toMatchObject({
      id: p6,
      descriptionHash: descHash,
      title: '',
      description: null,
      url: null,
    });

  }, 100000);
});
