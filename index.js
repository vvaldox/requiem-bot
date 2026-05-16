‎// ===================================
‎// IMPORTS
‎// ===================================
‎
‎const {
‎  Client,
‎  GatewayIntentBits,
‎  SlashCommandBuilder,
‎  Routes,
‎  REST,
‎  PermissionFlagsBits,
‎  ActionRowBuilder,
‎  ButtonBuilder,
‎  ButtonStyle,
‎  ModalBuilder,
‎  TextInputBuilder,
‎  TextInputStyle
‎} = require('discord.js');
‎
‎
‎
‎// ===================================
‎// CONFIG
‎// ===================================
‎
‎const TOKEN = process.env.TOKEN;
‎const CLIENT_ID = process.env.CLIENT_ID;
‎const APPLICATION_CHANNEL_ID =
‎  process.env.APPLICATION_CHANNEL_ID;
‎
‎
‎
‎// ===================================
‎// STORAGE
‎// ===================================
‎
‎const cooldowns = new Map();
‎const autoDeleteChannels = new Map();
‎
‎
‎
‎// ===================================
‎// CLIENT SETUP
‎// ===================================
‎
‎const client = new Client({
‎  intents: [
‎    GatewayIntentBits.Guilds,
‎    GatewayIntentBits.GuildMembers,
‎    GatewayIntentBits.GuildMessages,
‎    GatewayIntentBits.MessageContent,
‎    GatewayIntentBits.DirectMessages
‎  ]
‎});
‎
‎
‎
‎// ===================================
‎// READY EVENT
‎// ===================================
‎
‎client.once('ready', async () => {
‎
‎  console.log(`Logged in as ${client.user.tag}`);
‎
‎  const commands = [
‎
‎    // ===================================
‎    // CLEAR
‎    // ===================================
‎
‎    new SlashCommandBuilder()
‎      .setName('clear')
‎      .setDescription('Delete messages')
‎      .addIntegerOption(option =>
‎        option
‎          .setName('amount')
‎          .setDescription('1-100')
‎          .setRequired(true)
‎      )
‎      .setDefaultMemberPermissions(
‎        PermissionFlagsBits.ManageMessages
‎      ),
‎
‎    // ===================================
‎    // APPLY
‎    // ===================================
‎
‎    new SlashCommandBuilder()
‎      .setName('apply')
‎      .setDescription('Apply for the clan'),
‎
‎    // ===================================
‎    // CHAT
‎    // ===================================
‎
‎    new SlashCommandBuilder()
‎      .setName('chat')
‎      .setDescription('Styled message')
‎      .addStringOption(option =>
‎        option
‎          .setName('message')
‎          .setDescription('Message')
‎          .setRequired(true)
‎      ),
‎
‎    // ===================================
‎    // USERINFO
‎    // ===================================
‎
‎    new SlashCommandBuilder()
‎      .setName('userinfo')
‎      .setDescription('User info')
‎      .addUserOption(option =>
‎        option
‎          .setName('user')
‎          .setDescription('Select user')
‎          .setRequired(true)
‎      ),
‎
‎    // ===================================
‎    // RAID
‎    // ===================================
‎
‎    new SlashCommandBuilder()
‎      .setName('raid')
‎      .setDescription('Raid announcement')
‎      .addStringOption(option =>
‎        option
‎          .setName('time')
‎          .setDescription('Raid time')
‎          .setRequired(true)
‎      ),
‎
‎    // ===================================
‎    // CW
‎    // ===================================
‎
‎    new SlashCommandBuilder()
‎      .setName('cw')
‎      .setDescription('Clan war announcement')
‎      .addStringOption(option =>
‎        option
‎          .setName('time')
‎          .setDescription('CW time')
‎          .setRequired(true)
‎      ),
‎
‎    // ===================================
‎    // MEMBERCOUNT
‎    // ===================================
‎
‎    new SlashCommandBuilder()
‎      .setName('membercount')
‎      .setDescription('Server member count'),
‎
‎    // ===================================
‎    // WARN
‎    // ===================================
‎
‎    new SlashCommandBuilder()
‎      .setName('warn')
‎      .setDescription('Warn user')
‎      .addUserOption(option =>
‎        option
‎          .setName('user')
‎          .setDescription('User')
‎          .setRequired(true)
‎      )
‎      .addStringOption(option =>
‎        option
‎          .setName('reason')
‎          .setDescription('Reason')
‎          .setRequired(true)
‎      ),
‎
‎    // ===================================
‎    // BLACKLIST
‎    // ===================================
‎
‎    new SlashCommandBuilder()
‎      .setName('blacklist')
‎      .setDescription('Blacklist user')
‎      .addUserOption(option =>
‎        option
‎          .setName('user')
‎          .setDescription('User')
‎          .setRequired(true)
‎      ),
‎
‎    // ===================================
‎    // BLACKLISTED
‎    // ===================================
‎
‎    new SlashCommandBuilder()
‎      .setName('blacklisted')
‎      .setDescription('Check blacklist')
‎      .addUserOption(option =>
‎        option
‎          .setName('user')
‎          .setDescription('User')
‎          .setRequired(true)
‎      ),
‎
‎    // ===================================
‎    // TIMEOUT
‎    // ===================================
‎
‎    new SlashCommandBuilder()
‎      .setName('timeout')
‎      .setDescription('Timeout or untimeout user')
‎      .addUserOption(option =>
‎        option
‎          .setName('user')
‎          .setDescription('User')
‎          .setRequired(true)
‎      )
‎      .addIntegerOption(option =>
‎        option
‎          .setName('minutes')
‎          .setDescription('Minutes')
‎          .setRequired(true)
‎      )
‎      .addBooleanOption(option =>
‎        option
‎          .setName('enabled')
‎          .setDescription('True = timeout, False = remove')
‎          .setRequired(true)
‎      ),
‎
‎    // ===================================
‎    // AUTODELETE
‎    // ===================================
‎
‎    new SlashCommandBuilder()
‎      .setName('autodelete')
‎      .setDescription('Enable or disable autodelete')
‎      .addChannelOption(option =>
‎        option
‎          .setName('channel')
‎          .setDescription('Channel')
‎          .setRequired(true)
‎      )
‎      .addStringOption(option =>
‎        option
‎          .setName('time')
‎          .setDescription('Delete interval')
‎          .setRequired(true)
‎          .addChoices(
‎            { name: '1 Minute', value: '1m' },
‎            { name: '5 Minutes', value: '5m' },
‎            { name: '10 Minutes', value: '10m' },
‎            { name: '15 Minutes', value: '15m' },
‎            { name: '20 Minutes', value: '20m' },
‎            { name: '1 Hour', value: '1h' }
‎          )
‎      )
‎      .addBooleanOption(option =>
‎        option
‎          .setName('enabled')
‎          .setDescription('True or false')
‎          .setRequired(true)
‎      )
‎
‎  ].map(command => command.toJSON());
‎
‎  const rest = new REST({ version: '10' })
‎    .setToken(TOKEN);
‎
‎  try {
‎
‎    await rest.put(
‎      Routes.applicationCommands(CLIENT_ID),
‎      { body: commands }
‎    );
‎
‎    console.log('Commands loaded');
‎
‎  } catch (err) {
‎    console.log(err);
‎  }
‎
‎});
‎
‎
‎
‎// ===================================
‎// AUTO ROLE
‎// ===================================
‎
‎client.on('guildMemberAdd', async member => {
‎
‎  const role =
‎    member.guild.roles.cache.find(
‎      r => r.name === 'unregistered'
‎    );
‎
‎  if (!role) return;
‎
‎  try {
‎
‎    await member.roles.add(role);
‎
‎  } catch (err) {
‎    console.log(err);
‎  }
‎
‎});
‎
‎
‎
‎// ===================================
‎// INTERACTIONS
‎// ===================================
‎
‎client.on('interactionCreate', async interaction => {
‎
‎  // ===================================
‎  // SLASH COMMANDS
‎  // ===================================
‎
‎  if (interaction.isChatInputCommand()) {
‎
‎    // CLEAR
‎
‎    if (interaction.commandName === 'clear') {
‎
‎      const amount =
‎        interaction.options.getInteger('amount');
‎
‎      try {
‎
‎        const messages =
‎          await interaction.channel.bulkDelete(
‎            amount,
‎            true
‎          );
‎
‎        await interaction.reply({
‎          content:
‎`Deleted ${messages.size} messages.`,
‎          ephemeral: true
‎        });
‎
‎      } catch (err) {
‎
‎        await interaction.reply({
‎          content:
‎'Cannot delete old messages.',
‎          ephemeral: true
‎        });
‎
‎      }
‎
‎    }
‎
‎
‎
‎    // CHAT
‎
‎    if (interaction.commandName === 'chat') {
‎
‎      const message =
‎        interaction.options.getString('message');
‎
‎      await interaction.reply({
‎        content:
‎`✦ ──『 ${message} 』── ✦`
‎      });
‎
‎    }
‎
‎
‎
‎    // USERINFO
‎
‎    if (interaction.commandName === 'userinfo') {
‎
‎      const user =
‎        interaction.options.getUser('user');
‎
‎      const member =
‎        await interaction.guild.members.fetch(
‎          user.id
‎        );
‎
‎      await interaction.reply({
‎
‎        content:
‎`User: ${user.tag}
‎
‎ID: ${user.id}
‎
‎Joined:
‎${member.joinedAt}
‎
‎Created:
‎${user.createdAt}`
‎
‎      });
‎
‎    }
‎
‎
‎
‎    // RAID
‎
‎    if (interaction.commandName === 'raid') {
‎
‎      const time =
‎        interaction.options.getString('time');
‎
‎      await interaction.reply({
‎
‎        content:
‎`⚔️ RAID STARTING
‎
‎TIME:
‎${time}
‎
‎BE READY.`
‎
‎      });
‎
‎    }
‎
‎
‎
‎    // CW
‎
‎    if (interaction.commandName === 'cw') {
‎
‎      const time =
‎        interaction.options.getString('time');
‎
‎      await interaction.reply({
‎
‎        content:
‎`🏆 CLAN WAR
‎
‎TIME:
‎${time}
‎
‎EVERYONE JOIN.`
‎
‎      });
‎
‎    }
‎
‎
‎
‎    // MEMBERCOUNT
‎
‎    if (
‎      interaction.commandName ===
‎      'membercount'
‎    ) {
‎
‎      await interaction.reply({
‎
‎        content:
‎`Members:
‎${interaction.guild.memberCount}`
‎
‎      });
‎
‎    }
‎
‎
‎
‎    // WARN
‎
‎    if (interaction.commandName === 'warn') {
‎
‎      const user =
‎        interaction.options.getUser('user');
‎
‎      const reason =
‎        interaction.options.getString('reason');
‎
‎      await interaction.reply({
‎
‎        content:
‎`⚠️ ${user}
‎
‎has been warned.
‎
‎Reason:
‎${reason}`
‎
‎      });
‎
‎    }
‎
‎
‎
‎    // BLACKLIST
‎
‎    if (
‎      interaction.commandName ===
‎      'blacklist'
‎    ) {
‎
‎      const user =
‎        interaction.options.getUser('user');
‎
‎      const blacklistRole =
‎        interaction.guild.roles.cache.find(
‎          r => r.name === 'blacklisted'
‎        );
‎
‎      const member =
‎        await interaction.guild.members.fetch(
‎          user.id
‎        );
‎
‎      if (blacklistRole) {
‎
‎        await member.roles.add(
‎          blacklistRole
‎        );
‎
‎      }
‎
‎      await interaction.reply({
‎
‎        content:
‎`❌ ${user}
‎
‎has been blacklisted.`
‎
‎      });
‎
‎    }
‎
‎
‎
‎    // BLACKLISTED
‎
‎    if (
‎      interaction.commandName ===
‎      'blacklisted'
‎    ) {
‎
‎      const user =
‎        interaction.options.getUser('user');
‎
‎      const blacklistRole =
‎        interaction.guild.roles.cache.find(
‎          r => r.name === 'blacklisted'
‎        );
‎
‎      const member =
‎        await interaction.guild.members.fetch(
‎          user.id
‎        );
‎
‎      const blacklisted =
‎        blacklistRole &&
‎        member.roles.cache.has(
‎          blacklistRole.id
‎        );
‎
‎      await interaction.reply({
‎
‎        content:
‎blacklisted
‎? `${user.tag} is blacklisted.`
‎: `${user.tag} is not blacklisted.`
‎
‎      });
‎
‎    }
‎
‎
‎
‎    // TIMEOUT
‎
‎    if (interaction.commandName === 'timeout') {
‎
‎      const user =
‎        interaction.options.getUser('user');
‎
‎      const minutes =
‎        interaction.options.getInteger(
‎          'minutes'
‎        );
‎
‎      const enabled =
‎        interaction.options.getBoolean(
‎          'enabled'
‎        );
‎
‎      const member =
‎        await interaction.guild.members.fetch(
‎          user.id
‎        );
‎
‎      if (enabled) {
‎
‎        await member.timeout(
‎          minutes * 60000
‎        );
‎
‎        await interaction.reply({
‎
‎          content:
‎`${user.tag} timed out for ${minutes} minutes.`
‎
‎        });
‎
‎      } else {
‎
‎        await member.timeout(null);
‎
‎        await interaction.reply({
‎
‎          content:
‎`${user.tag} timeout removed.`
‎
‎        });
‎
‎      }
‎
‎    }
‎
‎
‎
‎    // AUTODELETE
‎
‎    if (
‎      interaction.commandName ===
‎      'autodelete'
‎    ) {
‎
‎      const channel =
‎        interaction.options.getChannel(
‎          'channel'
‎        );
‎
‎      const time =
‎        interaction.options.getString('time');
‎
‎      const enabled =
‎        interaction.options.getBoolean(
‎          'enabled'
‎        );
‎
‎      let interval;
‎
‎      if (time === '1m') interval = 60000;
‎      if (time === '5m') interval = 300000;
‎      if (time === '10m') interval = 600000;
‎      if (time === '15m') interval = 900000;
‎      if (time === '20m') interval = 1200000;
‎      if (time === '1h') interval = 3600000;
‎
‎      if (!enabled) {
‎
‎        if (
‎          autoDeleteChannels.has(
‎            channel.id
‎          )
‎        ) {
‎
‎          clearInterval(
‎            autoDeleteChannels.get(
‎              channel.id
‎            )
‎          );
‎
‎          autoDeleteChannels.delete(
‎            channel.id
‎          );
‎
‎        }
‎
‎        return interaction.reply({
‎
‎          content:
‎`Autodelete disabled in ${channel}.`
‎
‎        });
‎
‎      }
‎
‎      if (
‎        autoDeleteChannels.has(
‎          channel.id
‎        )
‎      ) {
‎
‎        clearInterval(
‎          autoDeleteChannels.get(
‎            channel.id
‎          )
‎        );
‎
‎      }
‎
‎      const deleteInterval =
‎        setInterval(async () => {
‎
‎          try {
‎
‎            const messages =
‎              await channel.messages.fetch({
‎                limit: 100
‎              });
‎
‎            await channel.bulkDelete(
‎              messages,
‎              true
‎            );
‎
‎          } catch (err) {
‎            console.log(err);
‎          }
‎
‎        }, interval);
‎
‎      autoDeleteChannels.set(
‎        channel.id,
‎        deleteInterval
‎      );
‎
‎      await interaction.reply({
‎
‎        content:
‎`Autodelete enabled in ${channel}.`
‎
‎      });
‎
‎    }
‎
‎
‎
‎    // APPLY
‎
‎    if (interaction.commandName === 'apply') {
‎
‎      const cooldown =
‎        cooldowns.get(interaction.user.id);
‎
‎      if (
‎        cooldown &&
‎        Date.now() - cooldown < 300000
‎      ) {
‎
‎        return interaction.reply({
‎
‎          content:
‎'Wait before applying again.',
‎
‎          ephemeral: true
‎        });
‎
‎      }
‎
‎      cooldowns.set(
‎        interaction.user.id,
‎        Date.now()
‎      );
‎
‎      const modal = new ModalBuilder()
‎        .setCustomId('applyModal')
‎        .setTitle('Clan Application');
‎
‎      const usernameInput =
‎        new TextInputBuilder()
‎          .setCustomId('username')
‎          .setLabel('Username')
‎          .setStyle(TextInputStyle.Short)
‎          .setRequired(true);
‎
‎      const skillInput =
‎        new TextInputBuilder()
‎          .setCustomId('skill')
‎          .setLabel('PvP Skill')
‎          .setStyle(TextInputStyle.Short)
‎          .setRequired(true);
‎
‎      const trustInput =
‎        new TextInputBuilder()
‎          .setCustomId('trust')
‎          .setLabel('Why trust you?')
‎          .setStyle(TextInputStyle.Paragraph)
‎          .setRequired(true);
‎
‎      modal.addComponents(
‎        new ActionRowBuilder()
‎          .addComponents(usernameInput),
‎
‎        new ActionRowBuilder()
‎          .addComponents(skillInput),
‎
‎        new ActionRowBuilder()
‎          .addComponents(trustInput)
‎      );
‎
‎      await interaction.showModal(modal);
‎
‎    }
‎
‎  }
‎
‎
‎
‎  // ===================================
‎  // MODAL SUBMIT
‎  // ===================================
‎
‎  if (interaction.isModalSubmit()) {
‎
‎    if (
‎      interaction.customId ===
‎      'applyModal'
‎    ) {
‎
‎      const username =
‎        interaction.fields.getTextInputValue(
‎          'username'
‎        );
‎
‎      const skill =
‎        interaction.fields.getTextInputValue(
‎          'skill'
‎        );
‎
‎      const trust =
‎        interaction.fields.getTextInputValue(
‎          'trust'
‎        );
‎
‎      const channel =
‎        await client.channels.fetch(
‎          APPLICATION_CHANNEL_ID
‎        );
‎
‎      const row =
‎        new ActionRowBuilder()
‎          .addComponents(
‎
‎            new ButtonBuilder()
‎              .setCustomId(
‎                `approve_${interaction.user.id}`
‎              )
‎              .setLabel('Approve')
‎              .setStyle(
‎                ButtonStyle.Success
‎              ),
‎
‎            new ButtonBuilder()
‎              .setCustomId(
‎                `pending_${interaction.user.id}`
‎              )
‎              .setLabel('Pending')
‎              .setStyle(
‎                ButtonStyle.Secondary
‎              ),
‎
‎            new ButtonBuilder()
‎              .setCustomId(
‎                `deny_${interaction.user.id}`
‎              )
‎              .setLabel('Denied')
‎              .setStyle(
‎                ButtonStyle.Danger
‎              )
‎
‎          );
‎
‎      await channel.send({
‎
‎        content:
‎`NEW APPLICATION
‎
‎User:
‎${interaction.user.tag}
‎
‎Username:
‎${username}
‎
‎PvP Skill:
‎${skill}
‎
‎Trust:
‎${trust}`,
‎
‎        components: [row]
‎
‎      });
‎
‎      await interaction.reply({
‎
‎        content:
‎'Application submitted.',
‎
‎        ephemeral: true
‎
‎      });
‎
‎    }
‎
‎  }
‎
‎
‎
‎  // ===================================
‎  // BUTTONS
‎  // ===================================
‎
‎  if (interaction.isButton()) {
‎
‎    const allowedRoles = [
‎      'staff',
‎      'admin',
‎      'moderator',
‎      'owner'
‎    ];
‎
‎    const hasPermission =
‎      interaction.member.roles.cache.some(
‎        role =>
‎          allowedRoles.includes(
‎            role.name.toLowerCase()
‎          )
‎      );
‎
‎    if (!hasPermission) {
‎
‎      return interaction.reply({
‎
‎        content:
‎'No permission.',
‎
‎        ephemeral: true
‎
‎      });
‎
‎    }
‎
‎    const memberId =
‎      interaction.customId.split('_')[1];
‎
‎    const member =
‎      await interaction.guild.members.fetch(
‎        memberId
‎      );
‎
‎    const registeredRole =
‎      interaction.guild.roles.cache.find(
‎        r => r.name === 'registered'
‎      );
‎
‎    const pendingRole =
‎      interaction.guild.roles.cache.find(
‎        r => r.name === 'pending'
‎      );
‎
‎    const unregisteredRole =
‎      interaction.guild.roles.cache.find(
‎        r => r.name === 'unregistered'
‎      );
‎
‎
‎
‎    // APPROVE
‎
‎    if (
‎      interaction.customId.startsWith(
‎        'approve_'
‎      )
‎    ) {
‎
‎      if (registeredRole) {
‎
‎        await member.roles.add(
‎          registeredRole
‎        );
‎
‎      }
‎
‎      if (
‎        pendingRole &&
‎        member.roles.cache.has(
‎          pendingRole.id
‎        )
‎      ) {
‎
‎        await member.roles.remove(
‎          pendingRole
‎        );
‎
‎      }
‎
‎      if (
‎        unregisteredRole &&
‎        member.roles.cache.has(
‎          unregisteredRole.id
‎        )
‎      ) {
‎
‎        await member.roles.remove(
‎          unregisteredRole
‎        );
‎
‎      }
‎
‎      await interaction.reply({
‎
‎        content:
‎`${member.user.tag} approved.`
‎
‎      });
‎
‎    }
‎
‎
‎
‎    // PENDING
‎
‎    if (
‎      interaction.customId.startsWith(
‎        'pending_'
‎      )
‎    ) {
‎
‎      if (pendingRole) {
‎
‎        await member.roles.add(
‎          pendingRole
‎        );
‎
‎      }
‎
‎      await interaction.reply({
‎
‎        content:
‎`${member.user.tag} pending.`
‎
‎      });
‎
‎    }
‎
‎
‎
‎    // DENY
‎
‎    if (
‎      interaction.customId.startsWith(
‎        'deny_'
‎      )
‎    ) {
‎
‎      if (
‎        pendingRole &&
‎        member.roles.cache.has(
‎          pendingRole.id
‎        )
‎      ) {
‎
‎        await member.roles.remove(
‎          pendingRole
‎        );
‎
‎      }
‎
‎      if (unregisteredRole) {
‎
‎        a
